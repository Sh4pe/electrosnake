import {app, BrowserWindow, IncomingMessage} from 'electron'
import {exec, ChildProcess} from 'child_process'
import {env as processEnv} from 'process'
import * as http from 'http'

/**
 * Run the child process `command` with altered environment. The environment of the
 * child process contains all variables of the parent process plus `key`=`value`.
 * @param key Additional variable name.
 * @param value Additional variable value.
 * @param command Command to be run.
 * @returns ChildProcess handle of the child process.
 */
function execWithEnv(key: string, value: string) : (command: string) => ChildProcess {
  return function(command: string) : ChildProcess {
    let newEnv = processEnv
    newEnv[key] = value
    let proc = exec(command, {env: newEnv}, (error, _stdout, _stderr) => {
      if (error !== null) {
        console.log(`error runnint ${command}: ${error}`)
      }
    })
    return proc
  }
}
let runFlask = execWithEnv('FLASK_APP', 'src/start_server.py')

/**
 * Enum indicating the result of checking server for readiness.
 */
enum ServerReadinessStatus {
  IsReady,
  SomeError
}

/**
 * Query flask server for readiness. If not yet ready, retry.
 * @param readinessUrl Url of readiness probe
 * @param expectedBody Expected value of body.
 * @param cb Callback to be run after probing for readiness
 */
function runWhenReady(readinessUrl: string, expectedBody: string) : (cb: (status: ServerReadinessStatus) => void) => void {
  function innerGet(cb: (status: ServerReadinessStatus) => void) : (message: http.IncomingMessage) => void {
    let data : string = ''
    return function(message: http.IncomingMessage) : void {
      message
        .on('data', (chunk) => { data += chunk; })
        .on('end',() => {
          if (data === expectedBody) {
            cb(ServerReadinessStatus.IsReady)
          } else {
            console.log(`expected body '${expectedBody}' but got '${data}`)
            cb(ServerReadinessStatus.SomeError)
          }
        }).on('error', (err) => {
          console.log(`Getting response of '${readinessUrl}' returned '${err}`)
        })
    }
  }
  let doRun = function (cb: (status: ServerReadinessStatus) => void) {
    let getHandler = innerGet(cb)
    http.get(readinessUrl, getHandler).on('error', (err) => {
      let timeoutMs = 100
      console.log(`Request to '${readinessUrl}' returned '${err}', will retry in ${timeoutMs} ms`)
      setTimeout(doRun, timeoutMs, cb)
    })
  }
  return doRun
}

/**
 * Start flask server on `port`. Callback is invoked when server is ready. If server fails to start,
 * callback is never invoked.
 * @param port 
 * @param cb Callback to be run once the server is ready. 
 * @returns [ChildProcess, string] ChildProcess handle and server Url.
 */
function startFlaskServer(port: number, cb: () => void) : [ChildProcess, string] {
  let proc = runFlask(`flask run -p ${port}`)
  let url = `http://127.0.0.1:${port}`
  runWhenReady(`${url}/readiness_probe`, 'ready')( (status: ServerReadinessStatus) => {
    if (status === ServerReadinessStatus.IsReady) {
      cb()
    } else {
      console.log(`Server on ${url} never got ready :(`)
    }
  })

  return [proc, url]
}

app.on('ready', () => {
    let win = new BrowserWindow()
    win.setBounds({x:100, y:100, width:400, height:300})

    let [serverProcess, serverUrl] = startFlaskServer(9999, () => {
      win.loadURL(serverUrl)
    })

    win.on('closed', () => {
      serverProcess.kill('SIGINT')
    });
})