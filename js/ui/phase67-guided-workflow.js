// Phase 67: source-scoped accessible lab tutorials; no UAT certification.
export const GUIDES={
logic:['Load the half-adder example','Run and inspect SUM/CARRY','Check truth-table evidence'],
chip:['Load RC filter example','Change a component value','Review model assumptions'],
quantum:['Load Bell-state example','Run the shot simulation','Review numerical evidence and hardware limits'],
cpu:['Load the CPU program','Assemble and run','Compare pipeline against reference'],
ai:['Run matrix workload','Compare precisions','Review reference errors and hardware limits'],
optics:['Load converging-lens example','Adjust screen distance','Review paraxial assumptions'],
crosslab:['Load cross-lab example','Run typed value transfer','Inspect independent lab assumptions']};
export function guideState(lab='logic',mode='beginner',step=0){
if(!Object.hasOwn(GUIDES,lab)||!['beginner','advanced'].includes(mode))throw Error('Invalid guide');
const actions=mode==='advanced'?[...GUIDES[lab],'Export and independently reproduce source evidence']:GUIDES[lab];
if(!Number.isInteger(step)||step<0||step>=actions.length)throw Error('Invalid step');
return {lab,mode,step,total:actions.length,action:actions[step],physicalValidation:'unknown'};
}
export function nextGuide(s,direction=1){return guideState(s.lab,s.mode,Math.max(0,Math.min(s.step+direction,s.total-1)))}
export function createGuideUI(root){
const panel=document.createElement('aside');panel.id='workspace-guide';panel.hidden=true;
panel.setAttribute('aria-label','Guided engineering workflow');
panel.innerHTML='<h2>Guided workflow</h2><label for="guide-level">Experience level</label><select id="guide-level"><option value="beginner">Beginner</option><option value="advanced">Advanced</option></select><p id="guide-status" role="status" aria-live="polite"></p><p id="guide-action"></p><p>Simulation checks do not establish physical qualification.</p><button type="button" id="guide-prev">Previous</button><button type="button" id="guide-next">Next</button><button type="button" id="guide-close">Close</button>';
root.appendChild(panel);let state=guideState();
const redraw=()=>{panel.querySelector('#guide-level').value=state.mode;panel.querySelector('#guide-status').textContent=state.lab+' — '+(state.step+1)+' of '+state.total;panel.querySelector('#guide-action').textContent=state.action;panel.querySelector('#guide-prev').disabled=state.step===0;panel.querySelector('#guide-next').disabled=state.step===state.total-1;};
panel.querySelector('#guide-prev').addEventListener('click',()=>{state=nextGuide(state,-1);redraw()});
panel.querySelector('#guide-next').addEventListener('click',()=>{state=nextGuide(state);redraw()});
panel.querySelector('#guide-level').addEventListener('change',e=>{state=guideState(state.lab,e.target.value);redraw()});
panel.querySelector('#guide-close').addEventListener('click',()=>{panel.hidden=true});
panel.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.hidden=true}});
redraw();
return {panel,setLab:lab=>{state=guideState(Object.hasOwn(GUIDES,lab)?lab:'crosslab');redraw()},toggle:()=>{panel.hidden=!panel.hidden;if(!panel.hidden)panel.querySelector('#guide-close').focus()},hide:()=>{panel.hidden=true},get state(){return state}};
}
