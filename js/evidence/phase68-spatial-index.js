// Phase68 bounded spatial culling index for 2D/3D presentation, not a physics solver.
export const FORMAT='invention-lab/phase68-spatial-scene-index/1';
const fail=m=>{throw Error(m)};const good=x=>typeof x==='number'&&Number.isFinite(x);
export function buildIndex(blocks,wires,{cellSize=160}={}){
 if(!Array.isArray(blocks)||!Array.isArray(wires)||blocks.length>50000||wires.length>100000||
 !good(cellSize)||cellSize<=0||cellSize>1e6)fail('Index capacity or cell size invalid');
 const byId=new Map(),cells=new Map();
 for(const b of blocks){
 if(!b||typeof b.id!=='string'||!b.id||byId.has(b.id)||!good(b.x)||!good(b.y)||Math.abs(b.x)>1e7||Math.abs(b.y)>1e7)fail('Invalid/duplicate scene block');
 byId.set(b.id,b);const key=Math.floor(b.x/cellSize)+','+Math.floor(b.y/cellSize);
 if(!cells.has(key))cells.set(key,[]);cells.get(key).push(b.id);
 }
 const wireIds=new Set(),adj=new Map();
 for(const w of wires){
 if(!w||!w.id||wireIds.has(w.id)||!w.from||!w.to||!byId.has(w.from.block)||!byId.has(w.to.block))fail('Invalid/duplicate scene wire');
 wireIds.add(w.id);
 for(const id of [w.from.block,w.to.block]){if(!adj.has(id))adj.set(id,[]);adj.get(id).push(w);}
 }
 return {format:FORMAT,cellSize,byId,cells,adj,blocks,wires};
}
function bounds(v){
 if(!v||![v.x0,v.y0,v.x1,v.y1].every(good)||v.x1<v.x0||v.y1<v.y0||Math.max(...Object.values(v).map(Math.abs))>2e7)fail('Invalid viewport');
 return v;
}
export function queryIndex(index,viewport){
 const b=bounds(viewport),loX=Math.floor(b.x0/index.cellSize),hiX=Math.floor(b.x1/index.cellSize),
 loY=Math.floor(b.y0/index.cellSize),hiY=Math.floor(b.y1/index.cellSize);
 if((hiX-loX+1)*(hiY-loY+1)>100000)fail('Viewport cell budget exceeded');
 const ids=new Set(),hits=[],wires=new Map();
 for(let x=loX;x<=hiX;x++)for(let y=loY;y<=hiY;y++)
  for(const id of index.cells.get(x+','+y)||[]){
   const block=index.byId.get(id);
   if(block.x<b.x0||block.x>b.x1||block.y<b.y0||block.y>b.y1)continue;
   ids.add(id);hits.push(block);
  }
 for(const id of ids)for(const w of index.adj.get(id)||[])if(ids.has(w.from.block)&&ids.has(w.to.block))wires.set(w.id,w);
 return {blocks:hits,wires:[...wires.values()]};
}
export function bruteQuery(blocks,wires,viewport){
 const b=bounds(viewport);
 const selected=blocks.filter(x=>x.x>=b.x0&&x.x<=b.x1&&x.y>=b.y0&&x.y<=b.y1);
 const ids=new Set(selected.map(x=>x.id));
 return {blocks:selected,wires:wires.filter(w=>ids.has(w.from.block)&&ids.has(w.to.block))};
}
export function benchmarkScene({rows=40,columns=40,cellSize=160}={}){
 if(!Number.isInteger(rows)||!Number.isInteger(columns)||rows<1||columns<1||rows*columns>20000)fail('Benchmark size invalid');
 const blocks=Array.from({length:rows*columns},(_,i)=>({id:'B'+i,x:(i%columns)*40,y:Math.floor(i/columns)*40}));
 const wires=blocks.slice(1).map((b,i)=>({id:'W'+i,from:{block:blocks[i].id,port:'out'},to:{block:b.id,port:'in'}}));
 const viewport={x0:90,y0:90,x1:350,y1:350},index=buildIndex(blocks,wires,{cellSize});
 const t0=process.hrtime.bigint(),brute=bruteQuery(blocks,wires,viewport),t1=process.hrtime.bigint();
 const indexed=queryIndex(index,viewport),t2=process.hrtime.bigint();
 const names=x=>x.map(o=>o.id).sort();
 if(JSON.stringify(names(brute.blocks))!==JSON.stringify(names(indexed.blocks))||JSON.stringify(names(brute.wires))!==JSON.stringify(names(indexed.wires)))fail('Indexed query differs from full-scan truth');
 return {format:FORMAT,blocks:blocks.length,wires:wires.length,visibleBlocks:indexed.blocks.length,
 visibleWires:indexed.wires.length,bruteQueryNs:Number(t1-t0),indexedQueryNs:Number(t2-t1),
 functionalConsistency:true,benchmarkEnvironment:'CURRENT_CI_RUNNER_ONLY',
 p95FrameTimeMeasured:null,hardwareRenderingAccelerationQualified:false,
 physicalValidation:'none',realWorldBuildSuccessPercent:null};
}
