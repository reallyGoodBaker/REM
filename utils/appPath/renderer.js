let paths

export async function getPath(name) {
      return paths ?? await hooks.invoke('paths?', name) 
}