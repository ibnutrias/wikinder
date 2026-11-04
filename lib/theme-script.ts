/**
 * Runs before React hydrates so the correct theme is painted on the first
 * frame. Dependency-free and defensive: anything unexpected falls back to the
 * system preference, then to `terang`.
 */
export const THEME_SCRIPT = `(function(){try{
var ALLOWED=["terang","gelap","sepia","kontras"];
var choice=null;
function read(key){
  try{
    var raw=window.localStorage.getItem(key);
    if(!raw) return null;
    var parsed=JSON.parse(raw);
    var data=parsed&&parsed.data?parsed.data:parsed;
    return data&&typeof data.theme==="string"?data.theme:null;
  }catch(e){return null;}
}
choice=read("wikinder:v2:settings");
if(!choice) choice=read("wikinder:v1:settings");
if(!choice) choice="system";
if(choice==="system"||ALLOWED.indexOf(choice)<0){
  var dark=false;
  try{dark=window.matchMedia("(prefers-color-scheme: dark)").matches;}catch(e){}
  choice=dark?"gelap":"terang";
}
document.documentElement.setAttribute("data-theme",choice);
}catch(e){document.documentElement.setAttribute("data-theme","terang");}})();`;
