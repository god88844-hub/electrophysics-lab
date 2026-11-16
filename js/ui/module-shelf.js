// module-shelf.js — accessible, opt-in reusable assembly UI.
// It edits metadata on the SAME diagram that the 2D/3D editors and engines use.
import { listAssemblies } from '../assembly/modules.js';

const element=(tag, label, className='')=>{
  const node=document.createElement(tag);
  if(label!==undefined)node.textContent=label;
  if(className)node.className=className;
  return node;
};
const action=(label,fn,cls='small')=>{
  const button=element('button',label,cls);
  button.type='button';
  button.addEventListener('click',fn);
  return button;
};

export class AssemblyShelf {
  constructor(container,handlers={}){
    this.handlers=handlers;
    this.diagram=null;this.templates=[];this.selectedBlockId=null;this.open=false;
    this.root=element('aside',undefined,'assembly-shelf');
    this.root.hidden=true;
    this.root.setAttribute('aria-label','Reusable computing assemblies');
    container.appendChild(this.root);
  }
  setData(diagram,templates=[],selectedBlockId=null){
    this.diagram=diagram;this.templates=templates;this.selectedBlockId=selectedBlockId;
    this.render();
  }
  toggle(open=!this.open){
    this.open=Boolean(open);this.root.hidden=!this.open;
    if(this.open)this.render();
    return this.open;
  }
  render(){
    if(!this.open)return;
    this.root.replaceChildren();
    const header=element('div',undefined,'assembly-header');
    header.append(element('h3','Computing assemblies'),
      action('Close',()=>this.toggle(false)));
    this.root.append(header);
    if(!this.diagram || !['logic','chip','quantum'].includes(this.diagram.lab)){
      this.root.append(element('p','Assemblies are available in the Logic, Chip and Quantum labs.','muted'));
      return;
    }
    const intro=element('p','Capture working blocks as reusable modules. Instances expand to real simulation blocks and wires—not a fake simulated black box.','muted');
    this.root.append(intro);
    this._captureSection();
    this._instancesSection();
    this._librarySection();
  }
  _captureSection(){
    const section=element('section',undefined,'assembly-section');
    section.append(element('h4','1 · Capture a module'));
    const label=element('label','Module name');
    const name=element('input');
    name.type='text';name.maxLength=100;name.placeholder='e.g. Ternary full adder';
    name.setAttribute('aria-label','Module name');
    label.appendChild(name);section.appendChild(label);
    const selected=element('div',undefined,'assembly-block-picker');
    const occupied=new Set((this.diagram.meta?.assemblies||[]).flatMap(g=>g.blockIds||[]));
    const checkboxes=[];
    for(const block of this.diagram.blocks){
      const item=element('label',undefined,'assembly-checkbox');
      const box=element('input');box.type='checkbox';box.value=block.id;
      box.disabled=occupied.has(block.id);
      box.checked=!box.disabled && (!this.selectedBlockId || block.id===this.selectedBlockId);
      item.append(box,document.createTextNode(block.id+' · '+block.type));
      selected.appendChild(item);checkboxes.push(box);
    }
    if(!checkboxes.length)selected.append(element('p','Add components to the design first.','muted'));
    section.appendChild(selected);
    const controls=element('div',undefined,'assembly-actions');
    controls.append(action('Select free blocks',()=>{
      for(const box of checkboxes)if(!box.disabled)box.checked=true;
    }));
    controls.append(action('Create module',()=>{
      const blockIds=checkboxes.filter(x=>x.checked&&!x.disabled).map(x=>x.value);
      try{this.handlers.onCreate?.({name:name.value,blockIds});}
      catch(err){this.handlers.onError?.(err.message);}
    },'primary'));
    section.append(controls);this.root.append(section);
  }
  _instancesSection(){
    const section=element('section',undefined,'assembly-section');
    section.append(element('h4','2 · Assemblies in this design'));
    const groups=listAssemblies(this.diagram);
    if(!groups.length)section.append(element('p','No assemblies yet.','muted'));
    for(const group of groups){
      const item=element('div',undefined,'assembly-entry');
      item.append(element('strong',group.name));
      item.append(element('p',group.blockIds.length+' components'+(group.staleBlockIds.length?' · missing members: '+group.staleBlockIds.join(', '):''),'muted'));
      const buttons=element('div',undefined,'assembly-actions');
      buttons.append(action('Explore in 3D',()=>this.handlers.onFocus?.(group.id)));
      buttons.append(action('Ungroup',()=>this.handlers.onUngroup?.(group.id)));
      item.append(buttons);section.append(item);
    }
    if(groups.length)section.append(action('Exit assembly focus',()=>this.handlers.onFocus?.(null)));
    this.root.append(section);
  }
  _librarySection(){
    const section=element('section',undefined,'assembly-section');
    section.append(element('h4','3 · Reusable module library'));
    const matches=this.templates.filter(t=>t.lab===this.diagram.lab);
    if(!matches.length)section.append(element('p','Capture a module to add it to your local library.','muted'));
    for(const template of matches){
      const item=element('div',undefined,'assembly-entry');
      item.append(element('strong',template.name));
      item.append(element('p',template.blocks.length+' real components · '+template.wires.length+' internal wires · '+template.interfaces.length+' exposed sockets','muted'));
      const buttons=element('div',undefined,'assembly-actions');
      buttons.append(action('Place copy',()=>this.handlers.onPlace?.(template.id),'primary'));
      buttons.append(action('Forget',()=>this.handlers.onRemoveTemplate?.(template.id)));
      item.append(buttons);
      section.append(item);
    }
    const controls=element('div',undefined,'assembly-actions');
    controls.append(action('Export library',()=>this.handlers.onExport?.()));
    const fileInput=element('input');
    fileInput.type='file';fileInput.accept='.json,application/json';
    fileInput.setAttribute('aria-label','Import computing module library');
    fileInput.addEventListener('change',async()=>{
      const file=fileInput.files?.[0];if(!file)return;
      try{await this.handlers.onImport?.(await file.text());}
      catch(err){this.handlers.onError?.(err.message);}
    });
    section.append(controls,fileInput);
    this.root.append(section);
  }
}
