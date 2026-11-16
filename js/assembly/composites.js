// composites.js — nested, parameterized computing modules; simulation stays
// on the SAME flattened Diagram. No independent or unvalidated black-box solver.
import { Diagram, uid } from '../core/diagram.js';
import { getComponent } from '../core/registry.js';
import { portOf } from '../core/block.js';
import { validateModuleTemplate, registerAssembly, serializeModuleLibrary,
  parseModuleLibrary, MODULE_FORMAT } from './modules.js';

export const COMPOSITE_FORMAT='invention-lab/computing-composite/1';
export const HIERARCHICAL_LIBRARY_FORMAT='invention-lab/module-library/2';
const MAX_DEPTH=8, MAX_LIBRARY=100, MAX_BLOCKS=250, MAX_WIRES=1500;
const MAX_CHILDREN=40, MAX_PARAMS=80, MAX_PORTS=512;
const copied=x=>structuredClone(x);
const isObj=x=>x!==null && typeof x==='object' && !Array.isArray(x);
const owns=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const noControls=x=>![...x].some(char=>char.charCodeAt(0)<32);
const isId=x=>typeof x==='string'&&x.trim().length>0&&x.length<=128&&
  !x.includes('/')&&!x.includes(String.fromCharCode(92))&&noControls(x)&&
  !['__proto__','prototype','constructor'].includes(x);
const isLabel=x=>typeof x==='string'&&x.trim().length>0&&x.length<=128&&noControls(x);
const position=x=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=1e6;
function fail(message){throw Error('Composite module: '+message);}
function requiredId(value,where){if(!isId(value))fail(where+' requires a safe nonempty ID');}
function requiredLabel(value,where){if(!isLabel(value))fail(where+' requires a nonempty label');}
const same=(a,b)=>a===b;
function signatureOk(a,b){
  return Boolean(a && b &&
    ((a.dir==='out'&&(b.dir==='in'||b.dir==='bidi')) ||
     (a.dir==='bidi'&&(b.dir==='bidi'||b.dir==='in'))) &&
    (a.type===b.type||a.type==='any'||b.type==='any'));
}
function portMap(ports){
  const map=new Map();
  for(const port of ports){
    if(!isId(port.name)||map.has(port.name))fail('duplicate or invalid interface name');
    map.set(port.name,port);
  }
  return map;
}
function numericParamCheck(value,schema,label){
  if(typeof value!=='number'||!Number.isFinite(value))fail(label+' must be a finite number');
  if(schema.min!==undefined&&value<schema.min)fail(label+' below allowed minimum');
  if(schema.max!==undefined&&value>schema.max)fail(label+' above allowed maximum');
  return value;
}
function requireLab(lab){if(!['logic','chip','quantum'].includes(lab))fail('unsupported or cross-lab computing model');}
function templatesById(library){
  if(!Array.isArray(library)||library.length>MAX_LIBRARY)fail('module library exceeds size limit');
  const map=new Map();
  for(const template of library){
    requiredId(template?.id,'template');
    if(map.has(template.id))fail('duplicate template ID '+template.id);
    map.set(template.id,template);
  }
  return map;
}
function childPorts(template){
  return portMap(template.interfaces||[]);
}
function checkNumericSelector(template,selector){
  if(template.format===MODULE_FORMAT){
    const b=template.blocks?.find(b=>b.id===selector.blockId);
    if(!b)fail('parameter binding references unknown block '+selector.blockId);
    const schema=getComponent(b.type)?.params?.find(p=>p.key===selector.paramKey);
    if(!schema||schema.type!=='number')fail('binding references nonnumeric or unknown component parameter');
    return {min:schema.min,max:schema.max,default:b.params[selector.paramKey]};
  }
  if(template.format===COMPOSITE_FORMAT){
    const p=template.parameters?.find(p=>p.name===selector.parameter);
    if(!p)fail('binding references unexposed child parameter');
    return {min:p.min,max:p.max,default:p.default};
  }
  fail('unsupported child parameter target');
}
function validateCompositeStructure(template,byId,stack=[]){
  if(!isObj(template)||template.format!==COMPOSITE_FORMAT)fail('invalid composite format');
  requiredId(template.id,'composite');
  requiredLabel(template.name,'name');
  requireLab(template.lab);
  if(stack.includes(template.id))fail('dependency cycle: '+[...stack,template.id].join(' -> '));
  if(stack.length>=MAX_DEPTH)fail('module dependency nesting exceeds depth '+MAX_DEPTH);
  const path=[...stack,template.id];
  if(!Array.isArray(template.children)||template.children.length<2||
    template.children.length>MAX_CHILDREN)fail('composite needs 2–40 child modules');
  if(!Array.isArray(template.wires)||template.wires.length>MAX_WIRES)fail('invalid composite wire count');
  if(!Array.isArray(template.interfaces)||template.interfaces.length>MAX_PORTS)fail('invalid composite exposed interface count');
  if(!Array.isArray(template.parameters)||template.parameters.length>MAX_PARAMS)fail('invalid composite parameter count');
  const children=new Map(), interfaces=new Map(), params=new Map();
  const boundTargets=new Set();
  for(const child of template.children){
    if(!isObj(child)||!isId(child.id)||children.has(child.id)||!isId(child.templateId)||
      !position(child.x)||!position(child.y))fail('invalid, duplicate or misplaced child module');
    const ref=byId.get(child.templateId);
    if(!ref)fail('missing dependency '+child.templateId);
    if(ref.lab!==template.lab)fail('cross-lab child '+child.templateId);
    if(ref.format===MODULE_FORMAT){
      const v=validateModuleTemplate(ref);
      if(!v.ok)fail('invalid child '+ref.id+': '+v.errors.join('; '));
    }else if(ref.format===COMPOSITE_FORMAT){
      validateCompositeStructure(ref,byId,path);
    }else fail('unsupported child format');
    children.set(child.id,{child,ref,ports:childPorts(ref)});
  }
  for(const p of template.parameters){
    if(!isObj(p)||!isId(p.name)||params.has(p.name)||!isObj(p.target))fail('invalid duplicate parameter declaration');
    const c=children.get(p.target.childId);
    if(!c)fail('parameter target child does not exist');
    const selector=p.target;
    const schema=checkNumericSelector(c.ref,selector);
    const targetKey=JSON.stringify(c.ref.format===MODULE_FORMAT
      ? [selector.childId,selector.blockId,selector.paramKey]
      : [selector.childId,selector.parameter]);
    if(boundTargets.has(targetKey))fail('duplicate parameter binding to child parameter');
    boundTargets.add(targetKey);
    numericParamCheck(p.default,schema,'parameter '+p.name);
    if(p.min!==undefined &&(!Number.isFinite(p.min)||schema.min!==undefined&&p.min<schema.min))fail('parameter minimum out of child bounds');
    if(p.max!==undefined &&(!Number.isFinite(p.max)||schema.max!==undefined&&p.max>schema.max))fail('parameter maximum out of child bounds');
    if(p.min!==undefined&&p.max!==undefined&&p.min>p.max)fail('inverted parameter range');
    if(p.min!==undefined&&p.default<p.min||p.max!==undefined&&p.default>p.max)fail('parameter default outside declared bounds');
    params.set(p.name,p);
  }
  const unique=new Set(),edgeKeys=new Set();
  for(const wire of template.wires){
    if(!isObj(wire)||!isId(wire.id)||unique.has(wire.id)||!isObj(wire.from)||!isObj(wire.to))fail('invalid/duplicate cross-module wire');
    unique.add(wire.id);
    const edgeKey=JSON.stringify([wire.from.childId,wire.from.port,wire.to.childId,wire.to.port]);
    if(edgeKeys.has(edgeKey))fail('duplicate cross-module connection');
    edgeKeys.add(edgeKey);
    const a=children.get(wire.from.childId)?.ports.get(wire.from.port);
    const b=children.get(wire.to.childId)?.ports.get(wire.to.port);
    if(!signatureOk(a,b))fail('incompatible or unknown cross-module interface connection');
    if(wire.from.childId===wire.to.childId&&wire.from.port===wire.to.port)fail('self-connected module interface');
  }
  const nameSet=new Set(),exposedTargets=new Set();
  for(const p of template.interfaces){
    if(!isObj(p)||!isId(p.name)||nameSet.has(p.name))fail('invalid/duplicate external interface');
    nameSet.add(p.name);
    const aliasTarget=JSON.stringify([p.childId,p.port]);
    if(exposedTargets.has(aliasTarget))fail('duplicate external interface alias');
    exposedTargets.add(aliasTarget);
    const inner=children.get(p.childId)?.ports.get(p.port);
    if(!inner||p.dir!==inner.dir||p.type!==inner.type)fail('external interface signature mismatch');
    interfaces.set(p.name,p);
  }
  return {children,interfaces,params};
}
export function validateCompositeTemplate(template,library){
  try{
    const byId=templatesById(library);
    if(byId.has(template?.id)&&byId.get(template.id)!==template &&
      JSON.stringify(byId.get(template.id))!==JSON.stringify(template))fail('template ID conflicts with library');
    validateCompositeStructure(template,byId);
    const flat=flattenComposite(template,library);
    return {ok:true,errors:[],blocks:flat.blocks.length,wires:flat.wires.length};
  }catch(err){return {ok:false,errors:[String(err.message)]};}
}
function overridesFor(overrides,definitions){
  if(!isObj(overrides))fail('parameter overrides must be an object');
  const found=new Map();
  const defs=new Map(definitions.map(p=>[p.name,p]));
  for(const [key,value] of Object.entries(overrides)){
    if(!defs.has(key))fail('unknown parameter override '+key);
    const p=defs.get(key);
    numericParamCheck(value,p,'override '+key);
    found.set(key,value);
  }
  for(const [name,p] of defs)if(!found.has(name))found.set(name,p.default);
  return found;
}
function blueprintLeaf(template,overrides={}){
  const v=validateModuleTemplate(template);
  if(!v.ok)fail('invalid leaf template '+template.id+': '+v.errors.join('; '));
  const blocks=template.blocks.map(b=>({...copied(b),id:b.id}));
  for(const block of blocks){
    if(!isId(block.id))fail('invalid leaf block ID: hierarchy separator or control character is forbidden');
  }
  const blockMap=new Map(blocks.map(b=>[b.id,b]));
  for(const [key,value] of Object.entries(overrides)){
    const split=key.lastIndexOf('.');
    if(split<=0)fail('leaf parameter key must be blockId.parameterName');
    const block=blockMap.get(key.slice(0,split));
    const paramKey=key.slice(split+1);
    const schema=getComponent(block?.type)?.params?.find(p=>p.key===paramKey);
    if(!schema||schema.type!=='number')fail('leaf override references nonnumeric or unknown parameter');
    numericParamCheck(value,schema,'leaf override '+key);
    block.params[paramKey]=value;
  }
  return {
    blocks,wires:copied(template.wires),
    ports:Object.fromEntries(template.interfaces.map(p=>[p.name,
      {blockId:p.blockId,portId:p.portId,dir:p.dir,type:p.type}])),
  };
}
function expand(template,byId,overrides,stack=[]){
  if(stack.length>=MAX_DEPTH)fail('hierarchical expansion exceeds maximum depth');
  if(template.format===MODULE_FORMAT)return blueprintLeaf(template,overrides);
  const {children,params}=validateCompositeStructure(template,byId,stack);
  const resolved=overridesFor(overrides,template.parameters);
  const perChild=new Map();
  for(const [name,value] of resolved){
    const p=params.get(name);
    const target=p.target;
    const key=target.parameter??(target.blockId+'.'+target.paramKey);
    const values=perChild.get(target.childId)||{};
    if(owns(values,key) && values[key]!==value)fail('conflicting parameter bindings for '+key);
    values[key]=value;
    perChild.set(target.childId,values);
  }
  const blocks=[],wires=[],endpoints=new Map();
  for(const [childId,{child,ref}] of children){
    const sub=expand(ref,byId,perChild.get(childId)||{},[...stack,template.id]);
    const idmap=new Map();
    for(const b of sub.blocks){
      const id=childId+'/'+b.id;
      if(!position(child.x+b.x)||!position(child.y+b.y))fail('expanded block coordinate outside supported range');
      idmap.set(b.id,id);
      blocks.push({...copied(b),id,x:child.x+b.x,y:child.y+b.y});
    }
    for(const w of sub.wires){
      wires.push({id:childId+'/'+w.id,
        from:{block:idmap.get(w.from.block),port:w.from.port},
        to:{block:idmap.get(w.to.block),port:w.to.port}});
    }
    for(const [portName,p] of Object.entries(sub.ports)){
      endpoints.set(childId+'\u0000'+portName,{
        blockId:idmap.get(p.blockId),portId:p.portId,dir:p.dir,type:p.type,
      });
    }
    if(blocks.length>MAX_BLOCKS||wires.length>MAX_WIRES)fail('expanded module exceeds block/wire budget');
  }
  for(const edge of template.wires){
    const a=endpoints.get(edge.from.childId+'\u0000'+edge.from.port);
    const b=endpoints.get(edge.to.childId+'\u0000'+edge.to.port);
    if(!a||!b||!signatureOk(a,b))fail('unresolvable typed interface wire');
    wires.push({id:'edge/'+edge.id,from:{block:a.blockId,port:a.portId},to:{block:b.blockId,port:b.portId}});
  }
  if(wires.length>MAX_WIRES)fail('expanded module exceeds wire budget');
  const ports={};
  for(const p of template.interfaces){
    const a=endpoints.get(p.childId+'\u0000'+p.port);
    if(!a)fail('unresolved external interface');
    ports[p.name]=copied(a);
  }
  return {blocks,wires,ports};
}
export function flattenComposite(template,library,{overrides={}}={}){
  const byId=templatesById(library);
  if(!byId.has(template?.id))byId.set(template.id,template);
  const blueprint=expand(template,byId,overrides);
  if(blueprint.blocks.length>MAX_BLOCKS||blueprint.wires.length>MAX_WIRES)fail('expanded design over size limit');
  return blueprint;
}
export function instantiateComposite(diagram,template,library,{
  x=0,y=0,name=template?.name,id=uid('assembly'),overrides={},
}={}){
  if(!(diagram instanceof Diagram)||diagram.lab!==template?.lab)fail('target Diagram has incompatible lab');
  if(!position(x)||!position(y))fail('placement must have finite bounded coordinates');
  requiredId(id,'assembly');requiredLabel(name,'assembly name');
  if((diagram.meta?.assemblies||[]).some(a=>a.id===id))fail('duplicate assembly ID');
  const blueprint=flattenComposite(template,library,{overrides});
  const candidate=diagram.clone();
  const blockStart=candidate.blocks.length,wireStart=candidate.wires.length,map=new Map();
  for(const b of blueprint.blocks){
    if(!position(x+b.x)||!position(y+b.y))fail('absolute block placement is out of range');
    const block=candidate.addBlock(b.type,{x:x+b.x,y:y+b.y,params:copied(b.params)});
    map.set(b.id,block.id);
  }
  for(const edge of blueprint.wires){
    const wire=candidate.connect(map.get(edge.from.block),edge.from.port,map.get(edge.to.block),edge.to.port);
    if(!wire)fail('duplicate internal flattened edge');
  }
  const exposed=Object.entries(blueprint.ports).map(([name,p])=>({
    name,blockId:map.get(p.blockId),portId:p.portId,dir:p.dir,type:p.type,
  }));
  const record=registerAssembly(candidate,{
    name,blockIds:[...map.values()],templateId:template.id,id,
  });
  // Bind the template's named interface and actual applied parameters to the
  // persistent group so a later composite can reuse this placed instance.
  const actual=candidate.meta.assemblies.find(a=>a.id===id);
  actual.interfaceBindings=Object.fromEntries(exposed.map(p=>[p.name,{
    blockId:p.blockId,portId:p.portId,dir:p.dir,type:p.type,
  }]));
  actual.parameterOverrides=copied(overrides);
  // Preserve the ordered flat provenance of every nested child path so the
  // visual explorer can zoom from parent → child → grandchild without creating
  // a second simulation graph. All memberships are real block IDs.
  const childrenByPath={};
  for(const [flatId,actualId] of map){
    const parts=flatId.split('/');
    for(let j=1;j<parts.length;j++){
      const path=parts.slice(0,j).join('/');
      (childrenByPath[path]??=[]).push(actualId);
    }
  }
  actual.childGroups=childrenByPath;
  diagram.blocks.push(...candidate.blocks.slice(blockStart));
  diagram.wires.push(...candidate.wires.slice(wireStart));
  diagram.meta.assemblies=candidate.meta.assemblies;
  return {
    assembly:copied(actual),createdBlockIds:[...map.values()],
    createdWireIds:candidate.wires.slice(wireStart).map(w=>w.id),exposedPorts:exposed,
  };
}
export function serializeHierarchicalLibrary(templates){
  const byId=templatesById(templates);
  for(const template of templates){
    if(template.format===MODULE_FORMAT){
      const v=validateModuleTemplate(template);
      if(!v.ok)fail('invalid leaf module '+template.id+': '+v.errors.join('; '));
    }else if(template.format===COMPOSITE_FORMAT){
      const v=validateCompositeTemplate(template,templates);
      if(!v.ok)fail('invalid composite '+template.id+': '+v.errors.join('; '));
    }else fail('unrecognized module format');
  }
  return JSON.stringify({format:HIERARCHICAL_LIBRARY_FORMAT,templates},null,2);
}
export function parseHierarchicalLibrary(raw){
  if(typeof raw!=='string'||raw.length>2_000_000)fail('library file too large');
  let obj;
  try{obj=JSON.parse(raw)}catch{fail('invalid module library JSON')}
  if(obj?.format==='invention-lab/module-library/1') return parseModuleLibrary(raw);
  if(obj?.format!==HIERARCHICAL_LIBRARY_FORMAT||!Array.isArray(obj.templates))fail('unknown library version');
  serializeHierarchicalLibrary(obj.templates);
  return copied(obj.templates);
}
function groupPorts(group,template,diagram){
  let mappings;
  if(isObj(group.interfaceBindings)){
    const names=new Set((template.interfaces||[]).map(p=>p.name));
    const bindings=Object.entries(group.interfaceBindings);
    if(bindings.length!==names.size||bindings.some(([name,p])=>
      !names.has(name)||!group.blockIds.includes(p?.blockId)||!diagram.block(p.blockId))) {
      fail('stored assembly interface mapping is stale');
    }
    mappings=new Map(bindings);
  }else{
    if(template.format!==MODULE_FORMAT)fail('nested group has no persisted interface mapping');
    const original=template.blocks.map(b=>b.id),ids=group.blockIds;
    let matched;
    if(original.every(id=>ids.includes(id)))matched=new Map(original.map(id=>[id,id]));
    else if(original.length===ids.length &&
      original.every((id,i)=>diagram.block(ids[i])?.type===template.blocks[i].type))
      matched=new Map(original.map((id,i)=>[id,ids[i]]));
    else fail('legacy assembly membership cannot be reconciled to template');
    mappings=new Map(template.interfaces.map(p=>[p.name,{
      blockId:matched.get(p.blockId),portId:p.portId,dir:p.dir,type:p.type,
    }]));
  }
  // A caller may edit project JSON. Never trust stored interface metadata
  // without checking its signature against the actual registered block port.
  for(const exposed of template.interfaces){
    const mapped=mappings.get(exposed.name);
    const block=diagram.block(mapped?.blockId);
    const actual=block && portOf(block,mapped?.portId);
    if(!mapped||!actual||mapped.dir!==exposed.dir||
      mapped.type!==exposed.type||actual.dir!==exposed.dir||actual.type!==exposed.type){
      fail('stored assembly interface signature or real port mismatch: '+exposed.name);
    }
  }
  return mappings;
}
/**
 * Capture existing named assemblies into a true composite blueprint.
 * Wires between assemblies become named cross-module connections; wires to
 * external components are NOT copied. This operation never mutates the design.
 */
export function captureCompositeFromAssemblies(diagram,groupIds,library,{id=uid('composite'),name}={}){
  if(!(diagram instanceof Diagram))fail('capture needs a Diagram');
  requiredId(id,'composite');requiredLabel(name,'composite name');
  if(!Array.isArray(groupIds)||groupIds.length<2||groupIds.length>MAX_CHILDREN||
    new Set(groupIds).size!==groupIds.length)fail('select 2–40 different assemblies');
  const byId=templatesById(library),groups=diagram.meta?.assemblies||[];
  const chosen=groupIds.map(id=>{
    const g=groups.find(g=>g.id===id);
    if(!g)fail('unknown assembly '+id);
    const t=byId.get(g.templateId);
    if(!t||t.lab!==diagram.lab)fail('missing or cross-lab assembly template');
    if(!g.blockIds?.length||g.blockIds.some(id=>!diagram.block(id)))fail('assembly has deleted members');
    return {g,t,ports:groupPorts(g,t,diagram)};
  });
  const memberMap=new Map();
  for(const [i,item] of chosen.entries()){
    for(const bid of item.g.blockIds){
      if(memberMap.has(bid))fail('assemblies overlap');
      memberMap.set(bid,i);
    }
  }
  const positions=chosen.map(({g})=>({
    x:Math.min(...g.blockIds.map(id=>diagram.block(id).x)),
    y:Math.min(...g.blockIds.map(id=>diagram.block(id).y)),
  }));
  const x0=Math.min(...positions.map(p=>p.x)),y0=Math.min(...positions.map(p=>p.y));
  const children=chosen.map(({g,t},i)=>({
    id:'child'+(i+1),templateId:t.id,x:positions[i].x-x0,y:positions[i].y-y0,
  }));
  const endpoint=new Map();
  for(let i=0;i<chosen.length;i++) {
    for(const [portName,p] of chosen[i].ports){
      const key=p.blockId+'\u0000'+p.portId;
      if(!endpoint.has(key))endpoint.set(key,[]);
      endpoint.get(key).push({
        childId:children[i].id,port:portName,dir:p.dir,type:p.type,
      });
    }
  }
  const connections=[],used=new Set();
  for(const wire of diagram.wires){
    const from=memberMap.get(wire.from.block),to=memberMap.get(wire.to.block);
    if(from===undefined||to===undefined||from===to)continue;
    const a=endpoint.get(wire.from.block+'\u0000'+wire.from.port)?.find(p=>p.childId===children[from].id);
    const b=endpoint.get(wire.to.block+'\u0000'+wire.to.port)?.find(p=>p.childId===children[to].id);
    if(!a||!b)fail('cross-assembly connection is absent from a module interface');
    connections.push({id:wire.id,from:{childId:a.childId,port:a.port},to:{childId:b.childId,port:b.port}});
    used.add(a.childId+'\u0000'+a.port);
    used.add(b.childId+'\u0000'+b.port);
  }
  const interfaces=[];
  for(const child of children){
    const item=chosen[children.indexOf(child)];
    for(const [portName,p] of item.ports){
      if(!used.has(child.id+'\u0000'+portName)){
        interfaces.push({name:child.id+'.'+portName,childId:child.id,port:portName,dir:p.dir,type:p.type});
      }
    }
  }
  const parameters=[];
  for(let i=0;i<chosen.length;i++){
    const {g,t}=chosen[i],childId=children[i].id;
    if(t.format===MODULE_FORMAT){
      const lookup=new Map(t.blocks.map((b,j)=>[b.id,
        diagram.block(g.blockIds.includes(b.id)?b.id:g.blockIds[j])]));
      for(const b of t.blocks){
        const actual=lookup.get(b.id);
        if(!actual||actual.type!==b.type)fail('captured group block type does not match template');
        for(const schema of getComponent(b.type)?.params||[]){
          if(schema.type!=='number')continue;
          const key=childId+'.'+b.id+'.'+schema.key;
          parameters.push({
            name:key,default:actual.params[schema.key],min:schema.min,max:schema.max,
            target:{childId,blockId:b.id,paramKey:schema.key},
          });
        }
      }
    }else{
      for(const p of t.parameters){
        parameters.push({
          name:childId+'.'+p.name,default:g.parameterOverrides?.[p.name]??p.default,
          min:p.min,max:p.max,target:{childId,parameter:p.name},
        });
      }
    }
  }
  if(parameters.length>MAX_PARAMS)fail('composite has too many exposed numeric parameter knobs');
  const composite={format:COMPOSITE_FORMAT,id,name,lab:diagram.lab,
    children,wires:connections,interfaces,parameters,
    origin:{kind:'assembly-composition',diagramId:diagram.id},
  };
  const verdict=validateCompositeTemplate(composite,library);
  if(!verdict.ok)fail(verdict.errors.join('; '));
  return composite;
}
