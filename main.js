const toggle=document.querySelector(".menu-toggle");
const nav=document.querySelector(".main-nav");
if(toggle&&nav){
  toggle.addEventListener("click",()=>{
    const open=toggle.getAttribute("aria-expanded")==="true";
    toggle.setAttribute("aria-expanded",String(!open));
    nav.classList.toggle("is-open",!open);
  });
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{
    toggle.setAttribute("aria-expanded","false");
    nav.classList.remove("is-open");
  }));
}
document.querySelectorAll("img[data-fallback]").forEach(img=>img.addEventListener("error",()=>img.style.display="none"));
const y=document.querySelector("#year");
if(y)y.textContent=new Date().getFullYear();

const hero=document.querySelector(".hero-home");
const crestTrigger=document.querySelector(".crest-trigger");
const crestCrossTrigger=document.querySelector(".crest-cross-trigger");
const crestMotion=document.querySelector(".hero-crest-motion");
const crestStage=document.querySelector(".crest-stage");

// Běžné kliknutí na erb znovu otevře rozcestník.
// Malé tlačítko křížku má vlastní akci a jeho handler zastaví propagaci.
if(hero&&crestTrigger&&crestStage){
  crestStage.addEventListener("click",event=>{
    if(event.target instanceof Element&&event.target.closest(".crest-cross-trigger"))return;
    if(hero.classList.contains("is-crest-motion")||hero.classList.contains("is-open"))return;

    hero.classList.add("is-open");
    crestTrigger.setAttribute("aria-pressed","true");
    crestTrigger.disabled=true;
    if(crestCrossTrigger)crestCrossTrigger.disabled=true;
    window.setTimeout(()=>hero.classList.add("is-sharp"),4200);
  });
}

// Animaci načteme a předdekódujeme hned při startu stránky,
// aby po kliknutí nezačalo čekání na stažení a dekódování snímků.
const easterEggFramesPromise=(async()=>{
  if(!("ImageDecoder" in window))throw new Error("Prohlížeč nepodporuje ImageDecoder.");
  const response=await fetch("assets/images/easter_egg.webp",{cache:"force-cache"});
  if(!response.ok)throw new Error("Soubor easter_egg.webp se nepodařilo načíst.");
  const bytes=await response.arrayBuffer();
  const decoder=new ImageDecoder({data:bytes,type:"image/webp"});
  await decoder.tracks.ready;
  const frameCount=decoder.tracks.selectedTrack?.frameCount||0;
  if(!frameCount)throw new Error("Animovaný WebP neobsahuje žádné snímky.");

  const frames=[];
  try{
    for(let frameIndex=0;frameIndex<frameCount;frameIndex++){
      const result=await decoder.decode({frameIndex,completeFramesOnly:true});
      const videoFrame=result.image;
      const bitmap=await createImageBitmap(videoFrame);
      frames.push({
        bitmap,
        duration:Math.max(20,Math.round((videoFrame.duration||100000)/1000))
      });
      videoFrame.close();
    }
  }finally{
    decoder.close();
  }
  return frames;
})().catch(error=>{
  console.error("Přednačtení animace easter_egg.webp selhalo:",error);
  return null;
});

if(hero&&crestCrossTrigger&&crestMotion){
  const context=crestMotion.getContext("2d");
  let playbackTimers=[];

  const finishAnimation=()=>{
    playbackTimers.forEach(timer=>window.clearTimeout(timer));
    playbackTimers=[];
    context.clearRect(0,0,crestMotion.width,crestMotion.height);
    hero.classList.remove("is-crest-motion");
    crestCrossTrigger.disabled=false;
  };

  crestCrossTrigger.addEventListener("click",async event=>{
    event.preventDefault();
    event.stopPropagation();
    if(hero.classList.contains("is-open")||hero.classList.contains("is-crest-motion"))return;

    hero.classList.add("is-crest-motion");
    crestCrossTrigger.disabled=true;

    try{
      const frames=await easterEggFramesPromise;
      if(!frames?.length)throw new Error("Přednačtené snímky animace nejsou dostupné.");

      // Canvas přebírá skutečný poměr stran zdrojových snímků.
      // CSS object-fit:contain jej zachová v původním kruhovém prostoru.
      crestMotion.width=frames[0].bitmap.width;
      crestMotion.height=frames[0].bitmap.height;

      let frameIndex=0;
      const showFrame=()=>{
        const frame=frames[frameIndex];
        context.clearRect(0,0,crestMotion.width,crestMotion.height);
        context.drawImage(frame.bitmap,0,0,crestMotion.width,crestMotion.height);
        frameIndex++;

        if(frameIndex<frames.length){
          playbackTimers.push(window.setTimeout(showFrame,frame.duration));
        }else{
          // Poslední snímek zůstane viditelný ještě dvě sekundy.
          playbackTimers.push(window.setTimeout(finishAnimation,2000));
        }
      };
      showFrame();
    }catch(error){
      console.error("Animaci easter_egg.webp se nepodařilo přehrát:",error);
      finishAnimation();
    }
  });
}

const homeHero=document.querySelector(".hero-home");
const hotspotMap=[[".hotspot-town","has-town"],[".hotspot-citizen","has-citizen"],[".hotspot-tourist","has-tourist"]];
if(homeHero){
  const clearHighlights=()=>hotspotMap.forEach(([,name])=>homeHero.classList.remove(name));
  const activateForTarget=target=>{
    if(!homeHero.classList.contains("is-open")||!homeHero.classList.contains("is-sharp"))return;
    const match=hotspotMap.find(([selector])=>target instanceof Element&&target.closest(selector));
    if(!match){clearHighlights();return;}
    clearHighlights();
    homeHero.classList.add(match[1]);
  };

  // Delegované události na hlavním obrazu jsou odolnější vůči změnám vrstev
  // a pořadí vykreslování jednotlivých tlačítek.
  homeHero.addEventListener("pointermove",event=>activateForTarget(event.target));
  homeHero.addEventListener("pointerleave",clearHighlights);
  homeHero.addEventListener("focusin",event=>activateForTarget(event.target));
  homeHero.addEventListener("focusout",event=>{
    if(!homeHero.contains(event.relatedTarget))clearHighlights();
  });
}