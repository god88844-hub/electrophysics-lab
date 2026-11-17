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
    this._composeSection();
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
      buttons.append(action('Explore in 3D',()=>this._safely(()=>this.handlers.onFocus?.(group.id))));
      buttons.append(action('Ungroup',()=>this._safely(()=>this.handlers.onUngroup?.(group.id))));
      item.append(buttons);
      const paths=Object.entries(group.childGroups||{}).sort(([a],[b])=>a.localeCompare(b));
      if(paths.length){
        const details=element('details');
        details.append(element('summary','Explore nested children ('+paths.length+')'));
        for(const [path,members] of paths){
          details.append(action('↳ '+path+' · '+members.length+' real blocks',
            ()=>this._safely(()=>this.handlers.onFocus?.(group.id,path))));
        }
        item.append(details);
      }
      section.append(item);
    }
    if(groups.length)section.append(action('Exit assembly focus',()=>this._safely(()=>this.handlers.onFocus?.(null))));
    this.root.append(section);
  }
  _safely(operation){
    try {return operation();}catch(error){this.handlers.onError?.(error.message);}
  }
  _composeSection(){
    const groups=listAssemblies(this.diagram).filter(g=>
      g.templateId && !g.staleBlockIds.length &&
      this.templates.some(t=>t.id===g.templateId && t.lab===this.diagram.lab));
    const section=element('section',undefined,'assembly-section');
    section.append(element('h4','3 · Compose modules inside a module'));
    section.append(element('p','Choose two or more existing assemblies. Their real cross-wires become child connections; numeric parameters become editable controls.','muted'));
    if(groups.length<2){
      section.append(element('p','Create at least two reusable assemblies to compose a nested module.','muted'));
      this.root.append(section);return;
    }
    const nameLabel=element('label','Nested module name');
    const name=element('input');name.type='text';name.maxLength=100;name.placeholder='e.g. Ternary processing stage';
    name.setAttribute('aria-label','Nested module name');nameLabel.append(name);section.append(nameLabel);
    const picker=element('div',undefined,'assembly-block-picker'),boxes=[];
    for(const group of groups){
      const row=element('label',undefined,'assembly-checkbox');
      const check=element('input');check.type='checkbox';check.value=group.id;
      row.append(check,document.createTextNode(group.name+' · '+group.blockIds.length+' blocks'));
      picker.append(row);boxes.push(check);
    }
    section.append(picker,action('Compose selected assemblies',()=>this._safely(()=>{
      const groupIds=boxes.filter(c=>c.checked).map(c=>c.value);
      this.handlers.onCompose?.({name:name.value,groupIds});
    }),'primary'));
    this.root.append(section);
  }
  _librarySection(){
    const section=element('section',undefined,'assembly-section');
    section.append(element('h4','4 · Reusable module library'));
    const matches=this.templates.filter(t=>t.lab===this.diagram.lab);
    if(!matches.length)section.append(element('p','Capture a module to add it to your local library.','muted'));
    for(const template of matches){
      const item=element('div',undefined,'assembly-entry');
      item.append(element('strong',template.name));
      const nested=template.format==='invention-lab/computing-composite/1';
      item.append(element('p',nested
        ? 'Nested module · '+template.children.length+' children · '+template.wires.length+' child connections · '+template.parameters.length+' numerical controls'
        : template.blocks.length+' real components · '+template.wires.length+' internal wires · '+template.interfaces.length+' exposed sockets','muted'));
      if(template.interfaces.length){
        const details=element('details');
        details.append(element('summary','Inspect real module interface sockets'));
        const list=element('ul',undefined,'assembly-interface-list');
        for(const port of template.interfaces){
          list.append(element('li',port.name+' — '+port.dir+' / '+port.type));
        }
        details.append(list);
        item.append(details);
      }
      const numericInputs=[];
      if(nested && template.parameters.length){
        const parameterDetails=element('details');
        parameterDetails.append(element('summary','Configure numeric parameters ('+template.parameters.length+')'));
        const fields=element('div',undefined,'assembly-param-fields');
        for(const p of template.parameters){
          const label=element('label',p.name);
          const input=element('input');input.type='number';input.step='any';
          input.value=String(p.default);
          if(p.min!==undefined)input.min=String(p.min);
          if(p.max!==undefined)input.max=String(p.max);
          input.setAttribute('aria-label','Module parameter '+p.name);
          label.append(input);
          fields.append(label);numericInputs.push([p,input]);
        }
        parameterDetails.append(fields);
        item.append(parameterDetails);
      }
      const buttons=element('div',undefined,'assembly-actions');
      buttons.append(action('Place copy',()=>this._safely(()=>{
        const overrides={};
        for(const [p,input] of numericInputs){
          if(input.value.trim()==='')throw Error('Missing numeric parameter '+p.name);
          overrides[p.name]=Number(input.value);
        }
        this.handlers.onPlace?.(template.id,overrides);
      }),'primary'));
      buttons.append(action('Forget',()=>this._safely(()=>this.handlers.onRemoveTemplate?.(template.id))));
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
