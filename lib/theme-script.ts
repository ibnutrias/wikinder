/**
 * Runs before React hydrates so the correct theme is painted on the first frame.
 * Kept dependency-free and defensive: anything unexpected falls back to paper.
 */
export const THEME_SCRIPT = `(function(){try{
var ALLOWED=["kertas","malam","sepia","kontras"];
var theme=null;
try{
  var raw=window.localStorage.getItem("wikinder:v1:settings");
  if(raw){
    var parsed=JSON.parse(raw);
    var data=parsed&&parsed.data?parsed.data:parsed;
    if(data&&typeof data.theme==="string"&&ALLOWED.indexOf(data.theme)>=0){theme=data.theme;}
  }
}catch(e){}
if(!theme){
  try{
    theme=window.matchMedia("(prefers-color-scheme: dark)").matches?"malam":"kertas";
  }catch(e){theme="kertas";}
}
document.documentElement.setAttribute("data-theme",theme);
}catch(e){document.documentElement.setAttribute("data-theme","kertas");}})();`;
