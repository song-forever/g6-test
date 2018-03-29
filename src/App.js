import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Modal} from 'antd';
import G6 from '@antv/g6';
import Plugins from '@antv/g6-plugins';

const {Util} = G6;
const miniMap = new Plugins['tool.minimap']();
const input = Util.createDOM('<input />', {
  position: 'absolute',
  zIndex: 10,
  display: 'none'
});
input.hide = function(){
  input.css({
    display: 'none'
  });
  input.visibility = false;
};
input.show = function(){
  input.css({
    display: 'block'
  });
  input.visibility = true;
};

class NodeAdd extends Component {
  
  render(){
    const IconStyle = {
      display:'inline-block',
      width:60,
      height:60,
      borderRadius:'50%',
      cursor:'pointer',
      border:'1px solid black'
    }
    return (
      <div style={IconStyle} onClick={() => this.props.add(this.props.type)}>{this.props.type}</div>
    )
  }
}

class App extends Component {
  constructor(){
    super()
    this.state = {
      visible:false
    }
  }

  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  }
  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  }

  add = (type) => {
    this.state.net.beginAdd('node',{
      id:type,
      shape:'shell',
      color:'black',
      label:type
    },() => {

      this.setState({
        visible:true
      })
    })
  }

  saveData = () => {
    const data = this.state.net.save();
    console.log(data);
  }

  clearAllActived = () => {
    this.state.net.clearAllActived();
    this.state.net.refresh(false);
  }

  showInputLabel = (shape,node) => {
    if(!node){
      return;
    }
    const rootGroup = this.state.net.get('rootGroup');
    const bbox = Util.getBBox(shape, rootGroup);
    const borderWidth = 1;
    this.clearAllActived();
    input.value = shape.attr('text');
    input.show();
    input.css({
      top: bbox.minY - borderWidth + 'px',
      left: bbox.minX - borderWidth + 'px',
      width: bbox.width + 'px',
      height: bbox.height + 'px',
      padding: '0px',
      margin: '0px',
      border: borderWidth + 'px solid #999'
    });
    input.focus();
    input.node = node;
  }

  updateLabel = () => {
    if(input.visibility){
      const node = input.node;
      this.clearAllActived();
      if(input.value !== node.get('model').label){
        if(input.value){
          this.state.net.update(node, {
            label: input.value
          });
        }
      }
      input.hide();
    }
  }

  componentDidMount() {
    console.log(G6);
    const that = this;
    let dragging = false;
    const net = new G6.Net({
      id:'editor',
      mode:'edit',
      fitView:'cc',
      height:window.innerHeight-90,
      plugins: [ miniMap ]
    });
    const graphContainer = net.get('graphContainer');
    graphContainer.appendChild(input);
    G6.registerNode('shell',{
      draw(cfg,group){
        return group.addShape('circle',{
          attrs:{
            x:cfg.x,
            y:cfg.y,
            r:30,
            fill:'#fff',
            stroke:cfg.color
          } 
        })
      },
      afterDraw(cfg,group){
        that.setState({
          // visible:true
        },() => {
          return group.addShape('text',{
            attrs:{
              x:cfg.x,
              y:cfg.y + 50,
              textAlign: 'center',
              fill: '#666',
              text:cfg.label
            }
          })
        })
      },
      getAnchorPoints(cfg,group){
        return [
          [0, 0.5],
          [1, 0.5],
        ];
      }
    })
    net.on('dragstart', e => {
      dragging = true;
      // net.beginAdd('node',{
      //   shape:'circle'
      // })
    })
    net.on('dragend', e => {
      dragging = false;
      // debugger
      // net.add('node',{
      //   shape:'circle'
      // })
    })
    // 进入锚点切换到曲线添加模式
    net.on('mouseenter', e => {
      const shape = e.shape;
      if(shape && shape.hasClass('anchor-point') && !dragging) {
        net.beginAdd('edge', {
          shape: 'line'
        });
      }
    });
    net.on('mouseup', e => {
      const shape = e.shape;
      if(shape && shape.hasClass('anchor-point')) {
        debugger
        that.setState({
          visible:true
        })
      }
    })
    net.on('dblclick', e => {
      const item = e.item;
      const shape = e.shape;
      if (shape && shape.get('type') === 'text') {
        // debugger
        this.showInputLabel(shape,item);
      }
    });
    input.on('keydown', ev=>{
      if(ev.keyCode === 13){
        this.updateLabel();
      }
    });
    
    input.on('blur', ()=>{
      this.updateLabel();
    });
    this.setState({
      net:net
    },() => {

    })
    const nodes = [{
      'x':100,
      'y':100,
      'id':'node1',
      'label':'11111111',
      'shape':'shell',
      'color':'red'
    },{
      'x':200,
      'y':100,
      'id':'kuai',
      'label':'222',
      'shape':'rect'
    }]
    net.source(nodes);
    net.render();
  }
  render() {
    
    return (
      <div className="App">
        <button onClick={this.saveData}>add</button>
        <NodeAdd type='shell' add={this.add} />
        <NodeAdd type='python' add={this.add} />
        <NodeAdd type='java' add={this.add} />
        {/* <NodeAdd type='square' add={this.add} /> */}
        <div id="editor" style={{display:'block',border:'1px solid red'}}>

        </div>
        <Modal title='test' visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel}>111111</Modal>
      </div>
    );
  }
}

export default App;