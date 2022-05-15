import React, { Component } from 'react';
// import SplitPane from 'react-split-pane';
import AceEditor from 'react-ace';
import 'brace/mode/html';
import 'brace/theme/tomorrow_night';
// import Frame from 'react-frame-component';
// import Todos from './todos';
import Browser from './Browser2';

const path = window.require('path');
const fs = window.require('fs');
const electron = window.require('electron');
const { ipcRenderer } = window.require('electron'); //
const fontSize = 16;
const toolbar_h = 70;
const css = `ul {
    display:flex;
    padding: 0;
    margin:0 0 0 0;
    list-style: none;
    flex-wrap:wrap;
    background-color: #777;
    align-items: baseline;
    justify-content: center;
    align-content:center;
    height:200;
    width:200;
}
li {
    background-color: #8cacea;
    margin: 8px;
    width:100px;
    overflow:hidden;
}
li:first-child
{ 
    line-height:1em;
    font-size:3em;
    height:100px;
}
li:last-child
{ 
    line-height:1em;
    font-size:2em;
    height:200px;
}`;
function HtmlEditor (props){
  const [state,setState]=React.useState({
    previewSize: { width: '50vw', height: '50vh' },
    css: css,
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>

</style>
</head>
<body>

</body>
</html>`,
    showPreview: 'none',
    html_editor_h: 600,
    edit_width: 800,
    filename: '',
    animationValue: '',
  });
  const cssChange = newv => {
    setState((state)=>({...state, css: newv }));
  };
  const htmlChange = newv => {
    setState((state)=>({...state, html: newv }))
  };
  // preview = () => {
  //   setState({csshtml: `<style>${state.css}</style>${state.html}`});
  // };
  ipcRenderer.on('save', () => {
    save_click();
  });
  // ipcRenderer.on('open_res', (e,res) => {
  //   console.log(e);
  //   console.log(res);
  //     if (!res) return;
  //     if(res.canceled) return;
  //     setState((state)=>({...state, filename: res.filePaths[0] }));
  //     let content = fs.readFileSync(res.filePaths[0], { encoding: 'utf-8', flag: 'r' });
  //     setState((state)=>({...state, html: content, showPreview: 'flex' }));
  // }); 
  cssEditor = React.useRef(null);
  htmlEditor = React.useRef(null);
  contactedit= React.useRef(null);
  const handleDragStart = () => {
    setState((state)=>({...state,
      dragging: true,
    }));
  };
  const onFileClick = filepath => {
    filepath = path.resolve(filepath);
    setState((state)=>({...state, filename: filepath }));
    let content = fs.readFileSync(filepath, { encoding: 'utf-8', flag: 'r' });
    if(path.extname(filepath)===".html"){
      setState((state)=>({...state, showPreview: 'flex' }));  
    }else{
      setState((state)=>({...state, showPreview: 'none' }));  
    }
    setState((state)=>({...state, html: content}));
  };
  const open_click = () => {
    var options ={
        defaultPath: path.resolve('./css_examples'),
        properties: ['openFile'],
        filters: [{ name: '*.html', extensions: ['html'] }],
    };
    electron.ipcRenderer.invoke("showOpenDialog",options).then((res)=>{
      console.log(res);
      if (!res) return;
      // if(res.canceled) return;
      setState((state)=>({...state, filename: res[0] }));
      let content = fs.readFileSync(res[0], { encoding: 'utf-8', flag: 'r' });
      setState((state)=>({...state, html: content, showPreview: 'flex' }));
    }).catch((e)=>{
      console.log(e);
    })
    // ipcRenderer.send("open", {
    //     defaultPath: path.resolve('./css_examples'),
    //     properties: ['openFile'],
    //     filters: [{ name: '*.html', extensions: ['html'] }],
    // });
    // ipcRenderer.once('open_res', (e,res) => {
    //   console.log(e);
    //   console.log(res);
    //   if (!res) return;
    //   if(res.canceled) return;
    //   setState((state)=>({...state, filename: res.filePaths[0] }));
    //   let content = fs.readFileSync(res.filePaths[0], { encoding: 'utf-8', flag: 'r' });
    //   setState((state)=>({...state, html: content, showPreview: 'flex' }));
    // }); 
  };
  const animationEnd = el => {
    var animations = {
      animation: 'animationend',
      OAnimation: 'oAnimationEnd',
      MozAnimation: 'mozAnimationEnd',
      WebkitAnimation: 'webkitAnimationEnd',
    };

    for (var t in animations) {
      if (el.style[t] !== undefined) {
        return animations[t];
      }
    }
    return;
  };
  const updateFrame = () => {
    let frame = window.frames['preview'];
    if (frame) {
      let filepath = path.dirname(state.filename);
      // let $ = cheerio.load(state.html,{
      //    xmlMode: true,
      //    lowerCaseTags: false
      // });
      // $("head").prepend(`<base href="${filepath}/" />`);
      let content = state.html;
      content = content.replace('<head>', `<head><base href="${filepath}/" />`);
      let doc = window.frames['preview'].document;
      if (!doc) return;
      try {
        doc.open();
        doc.write(content);
        doc.close();
      } catch (err) {
        console.log(err);
        // setState({filename:"about:blank"});
      }
    }
  };
  const anim = () => {
    //console.log(e.target.value);
    setState((state)=>(
      {...state,
        animationValue: 'flipInX animated',
      }));
    setTimeout(check, 1000);
  };
  const check = () => {
    if (animationEnd(contactedit.current)) {
      // console.log("end");
      setState((state)=>({...state, animationValue: '' }));
    } else {
      setTimeout(check, 1000);
    }
  };

  const save_as_click = () => {
    var options ={
        defaultPath: path.resolve('./css_examples'),
        filters: [{ name: '*.html', extensions: ['html'] }],
    };
    electron.ipcRenderer.invoke("showSaveDialog",options).then((res)=>{
      if (!res) return;
      setState((state)=>({...state, filename: res }));
      fs.writeFileSync(res, state.html);
    }).catch((e)=>{
      console.log(e);
    })

    // ipcRenderer.send("save", {
    //     defaultPath: path.resolve('./css_examples'),
    //     filters: [{ name: '*.html', extensions: ['html'] }],
    // });
    // ipcRenderer.once('save_res', (e,res) => {
    //   console.log(e);
    //   console.log(res);
    //   if (!res) return;
    //   if(res.canceled) return;
    //   setState((state)=>({...state, filename: res.filePath }));
    //   fs.writeFileSync(res.filePath, state.html);
    // }); 
  };
  const save_click = () => {
    if (state.filename != '') {
      anim();
      fs.writeFileSync(state.filename, state.html);
    } else {
      save_as_click();
    }
  };
  const handleDragEnd = () => {
    // console.log(cssEditor.current);
    cssEditor.current.editor.resize();
    htmlEditor.current.editor.resize();
    setState((state)=>({...state,
      dragging: false,
    }));
  };
  const newfile = () => {
    setState((state)=>({...state,
      filename: '',
      html:
        '<!DOCTYPE html><html><head>\n\n<style>\n\n</style></head><body>\n\n</body></html>',
    }));
  };
  const handleDrag = width => {
    setState((state)=>({...state, html_editor_h: width }));
  };
  const resetPreview = () => {
    let filename = state.filename;
    setState((state)=>({...state, filename: 'about:blank' }));
    // , () => {
    //   setState({ filename: filename });
    // });
  };
    // console.log(state);
    // let $ = cheerio.load(state.html,{
    //          xmlMode: true,
    //          lowerCaseTags: false
    //       });
    let html = state.html; //$("body").html();
    // let head=(<meta charSet="utf-8"></meta>);
    // updateFrame();
    let filepath = path.dirname(state.filename);
    let content = state.html;
    content = content.replace(
      '<head>',
      `<head><base href="${state.filename}" >`
    );
    return (
      <div id="root_new">
        <Browser onFileClick={onFileClick} />

        <div id="contain_edit">
          <div style={{ height: toolbar_h, backgroundColor: '#ccc' }}>
            <button
              style={{ margin: '10px 10px 10px 10px' }}
              onClick={open_click}
            >
              open
            </button>
            <span
              style={{
                display: 'inline-block',
                border: 'solid gray 2px',
                margin: '2px 2px 2px 2px',
              }}
              ref={contactedit}
              className={state.animationValue}
            >
              <button
                style={{ margin: '10px 10px 10px 10px' }}
                onClick={save_click}
              >
                save
              </button>
              <button
                style={{ margin: '10px 10px 10px 10px' }}
                onClick={save_as_click}
              >
                save as
              </button>
            </span>
            <button
              onClick={newfile}
              style={{ margin: '10px 10px 10px 10px' }}
            >
              New
            </button>
            <button onClick={anim}>anim</button>
            <div>{state.filename}</div>
          </div>
          <div
            style={{
              flex: 1,
              width: '100%',
              height: `calc(100vh - ${toolbar_h})`,
            }}
          >
            <AceEditor
              ref={htmlEditor}
              fontSize={fontSize}
              showPrintMargin={false}
              wrapEnabled={true}
              style={{
                margin: 'auto',
                width: '100%',
                height: '100%',
              }}
              mode="html"
              theme="tomorrow_night"
              value={state.html}
              onChange={htmlChange}
              name="htmlEd"
              editorProps={{ $blockScrolling: Infinity }}
            />
          </div>
        </div>
        <div id="contain_preview">
          <button
            onClick={() => {
              if (state.showPreview === 'none') {
                setState((state)=>({...state, showPreview: 'flex' }));
              } else {
                setState((state)=>({...state, showPreview: 'none' }));
              }
            }}
          >
            toggle preview
          </button>
          <div
            style={{
              margin: '10 10 10 10',
              ...state.previewSize,
              flexDirection: 'column',
              display: state.showPreview,
            }}
          >
            <button
              onClick={() => {
                if (state.previewSize.width === '50vw') {
                  setState((state)=>({...state,
                    previewSize: { width: '100vw', height: '100vh' },
                  }));
                } else {
                  setState((state)=>({...state,
                    previewSize: { width: '50vw', height: '50vh' },
                  }));
                }
              }}
            >
              toggle max
            </button>
            <iframe
              name="preview"
              srcDoc={content}
              style={{ width: '100%', height: '100%' }}
            />
            {
              // <Frame style={{width:"100%",height:"100%"}} head={head}>
              //   <div dangerouslySetInnerHTML={{
              //      __html: `${html}`,
              //    }}>
              //   </div>
              //  </Frame>
            }
          </div>
        </div>
        <style jsx="true">{`
          body {
            margin: 0 0 0 0;
            padding: 0 0 0 0;
          }
          #root_new {
            margin: 0 0 0 0;
            padding: 0 0 0 0;
            display:flex;
            flex-direction:row;
            width: 100%;
            height: 100%;
          }
          #contain_edit {
            height: 100vh;
            flex:1;
            display:flex;
            flex-direction:column;
          }
          #contain_preview {
            background-color:#eee;
            position:fixed;
            display:flex;
            flex-direction:column;
            right:0;
            top:0;
            margin:0 0 0 0;
            padding：0 0 0 0;
            overflow: auto;
            z-index:100;
          }
          .SplitPane {
            position: relative !important;
          }
          .Resizer {
            background: #000;
            opacity: 0.2;
            z-index: 1;
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            -moz-background-clip: padding;
            -webkit-background-clip: padding;
            background-clip: padding-box;
          }

          .Resizer:hover {
            -webkit-transition: all 2s ease;
            transition: all 2s ease;
          }

          .Resizer.horizontal {
            height: 11px;
            margin: -5px 0;
            border-top: 5px solid rgba(255, 255, 255, 0);
            border-bottom: 5px solid rgba(255, 255, 255, 0);
            cursor: row-resize;
            width: 100%;
          }

          .Resizer.horizontal:hover {
            border-top: 5px solid rgba(0, 0, 0, 0.5);
            border-bottom: 5px solid rgba(0, 0, 0, 0.5);
          }

          .Resizer.vertical {
            width: 11px;
            margin: 0 -5px;
            border-left: 5px solid rgba(255, 255, 255, 0);
            border-right: 5px solid rgba(255, 255, 255, 0);
            cursor: col-resize;
          }

          .Resizer.vertical:hover {
            border-left: 5px solid rgba(0, 0, 0, 0.5);
            border-right: 5px solid rgba(0, 0, 0, 0.5);
          }
          .Resizer.disabled {
            cursor: not-allowed;
          }
          .Resizer.disabled:hover {
            border-color: transparent;
          }
        `}</style>
      </div>
    );
}
export default HtmlEditor;
