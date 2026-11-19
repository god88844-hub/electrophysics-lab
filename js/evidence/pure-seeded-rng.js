// Pure seeded RNG shared by browser topology/quantum UI and Node Monte Carlo.
// No native file/process imports or external effects.
export function seededUniformGenerator(seed){
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('Seed must be uint32');
 let x=seed>>>0;
 return ()=>{x=(x+0x6d2b79f5)>>>0;let t=Math.imul(x^(x>>>15),1|x);
  t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};
}
