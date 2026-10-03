import { loadPyodide } from './runtime/pyodide.mjs';
let engine;
async function prepare() {
  self.postMessage({status:'Preparing the captains…'});
  const py = await loadPyodide({indexURL:new URL('./runtime/',import.meta.url).href});
  const response = await fetch(new URL('./engine.zip?v=stable-37',import.meta.url),{cache:'no-cache'});
  if (!response.ok) throw new Error('The game files could not be loaded. Please try again.');
  py.FS.mkdir('/game');
  py.FS.chdir('/game');
  py.unpackArchive(new Uint8Array(await response.arrayBuffer()),'zip');
  await py.runPythonAsync("import sys, json; sys.path.insert(0, '/game'); from browser_bridge import dispatch");
  self.postMessage({status:'ready'});
  return py;
}
self.onmessage = async ({data}) => {
  try {
    if (!engine) engine = prepare().catch(error => {engine=null;throw error});
    const py = await engine;
    py.globals.set('message_json',JSON.stringify(data.message));
    const result = JSON.parse(py.runPython('dispatch(json.loads(message_json))'));
    self.postMessage({id:data.id,result});
  } catch(error) {
    console.error(error);
    self.postMessage({id:data.id,error:String(error.message||error)});
  }
};
