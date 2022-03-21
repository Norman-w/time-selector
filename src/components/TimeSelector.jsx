import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';


import classes from './TimeSelector.module.css'
//region 默认的表参数
const defaultSetting=
  {
    controlSize:300,
    centerSize:20,
    clockSize:300*0.8,
    numberClockSize:300*0.2,
    backColor:'white',
  }
//endregion

class TimeSelector extends Component {

  _constValue=
    {
      R2D : 180 / Math.PI,
    };
  save={
    hour:0,
    minute:0,
    moving:false,
    lastUpdateTime:{hour:0,minute:0,round:0},
    draggingPointer:'',
    mouseMoveAngle:0,
    center:null,
    round:0,//圈数   圈数0 是从0点起的第一圈,圈数 1 是下午的那一圈. 下午那一圈的0点是12点.,
  };

//region 鼠标移动的时候记录角度
  handleMouseMove =(e)=>
  {
    if(!this.save.center || this.save.center.length !==2)
    {
      return false;
    }
    if (this.save.draggingPointer==='hour' || this.save.draggingPointer === 'minute')
    {
      this.save.moving=true;

      //region 计算鼠标角度
      var x = e.clientX - this.save.center[0];
      var y = e.clientY - this.save.center[1];
      var currentAngle = this._constValue.R2D * Math.atan2(x, -y);
      let currentAngle360 = currentAngle;
      if (currentAngle<0)
      {
        currentAngle360=180-(0-currentAngle) + 180;
      }
      //endregion
      //region 根据指针名称和角度 计算时间
      let oldTime = this.save.lastUpdateTime;
      if (this.save.draggingPointer === 'hour') {
        this.save.hour = Math.floor(currentAngle360 / 30);
        this.save.minute = Math.round((currentAngle360 % 30) * 2);
      } else if (this.save.draggingPointer === 'minute') {
        this.save.minute = Math.round(currentAngle360 / 6);
      }
      //region 59.5-60秒 都会四舍五入到60,这时应该让60做为0展示
      if (this.save.minute === 60) {
        this.save.minute = 0;
        if(this.save.draggingPointer === 'hour')
        {
          this.save.hour = (this.save.hour+1)%12;
        }
      }
      //endregion
      //region 如果是分针往新的小时方向移动的话 增减小时
      if (this.save.draggingPointer === 'minute') {
        if (this.save.lastUpdateTime.minute > 45 && this.save.lastUpdateTime.minute < 60 && this.save.minute >= 0 && this.save.minute < 15) {
          //向右侧移动;
          // console.log('需要增加时间,当前早时间:', save.hour);
          let newHour = (this.save.hour + 1) % 12;
          if (newHour < 0) {
            newHour = 12 + newHour;
          }
          this.save.hour = newHour;
          // console.log('需要增加时间,当前', newHour)
        } else if (this.save.lastUpdateTime.minute >= 0 && this.save.lastUpdateTime.minute < 15 && this.save.minute > 45 && this.save.minute < 60) {
          //向右侧移动;
          let newHour = (this.save.hour - 1) % 12;
          if (newHour < 0) {
            newHour = 12 + newHour;
          }
          this.save.hour = newHour;
        }
      }
      //endregion
      if(oldTime.hour!==this.save.hour && oldTime.hour<12 && oldTime.hour>=9 && this.save.hour >=0 && this.save.hour <=3)
      {
        //增加时间
        this.save.round = Math.abs(this.save.round+1)%2;
        // console.log('需要更新上下午.',save.round);
      }
      else if(oldTime.hour!==this.save.hour &&  oldTime.hour>=0 && oldTime.hour<=3 && this.save.hour<12 && this.save.hour>=9)
      {
        this.save.round = Math.abs(this.save.round-1)%2;
        // console.log('需要更新上下午.',save.round);
      }
      let newTime =  {hour:this.save.hour,minute:this.save.minute,round:this.save.round};
      if (newTime.minute === oldTime.minute)
      {
        return null;
      }
      // console.log('新时间:',newTime,'老时间',oldTime)
      //endregion
      return newTime
    }
    return false;
  }
//endregion

  setDraggingPointer = function (e)
  {
    this.save.draggingPointer = e;
  }
  setCenter = function (e)
  {
    this.save.center = e;
  }

//region 选择面板的样式
  rowStyle= {
    width:'100%',
    // height:''+Math.floor(100/rowCount) + '%',
    // border:' 1px solid red',
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:"center",
  };
  gridStyle = {
    // width:''+Math.floor(100/colCount) + '%',
    height: '100%',
    // border:' 1px solid blue',
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:"center",
  }
  gridContentStyle =
    {
      display:'flex',
      flexDirection:'row',
      justifyContent:'center',
      alignItems:"center",
      width:'80%', height:'80%', border:'1px dashed lightSkyBlue',
      borderRadius: '5px',
      transition: '0.4s',
      userSelect:'none',
      cursor:'pointer',
    };
  gridContentHoverStyle =
    {
      ...this.gridContentStyle,
      boxShadow: '0 0 18px 2px lightGray inset, 0 0 3px 2px lightSkyBlue',
      border: 'none',
    }
//endregion
//region 获取小时或者分钟的选择文字集合
  getSelectorDom= function (start,end,colCount,rowCount, hoverItem, setHoverItemFunc,selectCallBack)
  {
    if (start>=0 && end>=0 && colCount>=1 && rowCount>=1) {
      //region 样式定义
      let rs = {...this.rowStyle,
        height:''+Math.floor(100/rowCount) + '%',
      }
      let gs = {...this.gridStyle,
        width:''+Math.floor(100/colCount) + '%',
      }

      //endregion
      let count = end - start;
      if (count < 0) {return null;}
      let ret = [];
      for (let i = 0; i < rowCount; i++) {
        let girds = [];
        for (let j = 0; j < colCount; j++) {
          let realGridContentStyle = (hoverItem === ''+i+'.'+j)? this.gridContentHoverStyle:this.gridContentStyle;
          let index = i*colCount+j;
          let text = '';
          if (count === 12 && index ===0)
          {
            text = '0/12';
          }
          else if(count === 60 && index <10)
          {
            text = (''+index).padStart(2,'0');
          }
          else
          {
            text = ''+index;
          }
          let div = <div style={gs}>
            <div style={realGridContentStyle}
                 onMouseEnter={event => {
                   setHoverItemFunc(''+i+'.'+ j);
                 }}
                 onMouseLeave={event => {
                   setHoverItemFunc(null);
                 }}
                 onClick={()=>{
                   if (selectCallBack)
                   {
                     selectCallBack(index)
                   }
                 }}
            >
              {text}
            </div>
          </div>;
          girds.push(div)
        }
        let row = <div style={rs}>{girds}</div>
        ret.push(row);
      }
      return ret;
    }
  }
//endregion
//region 数字式时间选择的样式
  timeTextEditor =
    {

      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 0 3px 2px lightgrey',
      // width: '300px',
      // minHeight: '70px',
      // height: '70px',
      // fontSize: '70px',
      // marginTop: '10px',
      // borderRadius: '40px',
    }
//endregion
  //region state 和 setstate的函数
  state=
    {
      time:{},showingSelector:null,round:0,hoverSelectorItem:null,
    }
  setTime (value)
  {
    this.setState({time:value});
  }
  setShowingSelector(value)
  {
    this.setState({showingSelector:value});
  }
  setRound(value)
  {
    this.setState({round:value});
  }
  setHoverSelectorItem(value)
  {
    this.setState({hoverSelectorItem:value});
  }
  getAndSaveCenterFunc= ()=>
  {
    //region  点击的时候获取表盘的中心.这样的话 方便该插件在父级位置改变或者是在窗体大小改变的时候再次获取中心保证表盘中心位置的正确性
    var c = document.getElementById('centerDom')
    if (c) {
      var centerPoint = findDOMNode(c);
      if (centerPoint) {
        // console.log('centerPoint', centerPoint);
        let bound = centerPoint.getBoundingClientRect();
        this.setCenter([bound.left + bound.width / 2, bound.top + bound.height / 2])
      }
    }
    //endregion
  }
  componentDidMount() {
    if (!this.save.center) {
      console.log('重新加载了');
      if (this.props.time)
      {
        this.setTime(this.props.time);
        this.save.hour = this.props.time.hour;
        this.save.round = this.props.time.round;
        this.save.minute = this.props.time.minute;
        this.save.lastUpdateTime= this.props.time;
        this.setRound(this.props.time.round);
      }
      this.getAndSaveCenterFunc();
    }
  }

  //endregion
  render() {
    let debug = this.props.debug;
    let msg = '';
    //region 表的参数
    let controlSize = this.props.controlSize? this.props.controlSize:defaultSetting.controlSize;//整个控件的大小
    let centerSize = this.props.centerSize? this.props.centerSize:defaultSetting.centerSize;
    let clockSize = this.props.clockSize? this.props.centerSize:defaultSetting.clockSize;
    //endregion
    //region state 和函数

    let time = this.state.time;
    let showingSelector = this.state.showingSelector;
    let round = this.state.round;
    let hoverSelectorItem = this.state.hoverSelectorItem;
    let setTime = this.setTime.bind(this);
    let setShowingSelector = this.setShowingSelector.bind(this);
    let setRound = this.setRound.bind(this);
    let setHoverSelectorItem = this.setHoverSelectorItem.bind(this);
    //endregion

    //region 获取表的中心
    //endregion
    //region 表盘和中心
    //region 表盘
    let clockStyle = {
      width: clockSize + 2,
      height: clockSize + 2,
      boxShadow:'0 0 5px 1px #e7cac7',
      borderRadius: (clockSize + 2) / 2,
      transition : '0.5s',
      position:'relative',
      backgroundColor:'white',
      // border:'1px solid red'
    }
    //endregion
    //region 中心圆点的style
    let centerRedStyle = {
      width: centerSize,
      height: centerSize,
      top: (clockSize - centerSize) / 2,
      left: (clockSize - centerSize) / 2,
      borderRadius: centerSize / 2,
    };
    //endregion
    //endregion

    //region 刻度表
    //region 一刻钟的元素dom
    let quartersDom = [];
    let quarterMarkWidth = 6;
    let quarterMarkHeight = 15;
    let quarterMarkOffsetX = (clockSize - quarterMarkWidth) / 2;
    let quarterMarkOffsetY = (clockSize - quarterMarkHeight) / 2;
    for (let i = 0; i < 4; i++) {
      //region 一刻钟的显示
      let quarterStyle =
        {
          width: quarterMarkWidth,
          height: quarterMarkHeight,
          backgroundColor: 'salmon',
          position: 'absolute',
          left: quarterMarkOffsetX,
          top: quarterMarkOffsetY,
          transform: 'rotateZ(' + i * 90 + 'deg) translateY(-' + (quarterMarkOffsetY - 3) + 'px)',
        }
      //endregion
      quartersDom.push(
        <div style={quarterStyle} key={'quarter'+i}></div>
      )
    }
    //endregion
    //region 五分钟的元素dom
    let fiveMDoms = [];
    let fiveMarkWidth = 4;
    let fiveMarkHeight = 8;
    let fiveMarkOffsetX = (clockSize - fiveMarkWidth) / 2;
    let fiveMarkOffsetY = (clockSize - fiveMarkHeight) / 2;
    for (let i = 0; i < 12; i++) {
      if (i % 3 === 0) {
        continue;
      }
      //region 五分钟的显示
      let fiveStyle =
        {
          width: fiveMarkWidth,
          height: fiveMarkHeight,
          backgroundColor: 'salmon',
          position: 'absolute',
          left: fiveMarkOffsetX,
          top: fiveMarkOffsetY,
          transform: 'rotateZ(' + i * 30 + 'deg) translateY(-' + (fiveMarkOffsetY - 3) + 'px)',
        }
      //endregion
      fiveMDoms.push(
        <div style={fiveStyle} key={'five'+i}></div>
      )
    }
    //endregion
    //region 一分钟的元素dom
    let oneMDoms = [];
    let oneMarkWidth = 2;
    let oneMarkHeight = 4;
    let oneMarkOffsetX = (clockSize - oneMarkWidth) / 2;
    let oneMarkOffsetY = (clockSize - oneMarkHeight) / 2;
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) {
        continue;
      }
      //region 一分钟的显示
      let oneStyle =
        {
          width: oneMarkWidth,
          height: oneMarkHeight,
          backgroundColor: 'gray',
          position: 'absolute',
          left: oneMarkOffsetX,
          top: oneMarkOffsetY,
          transform: 'rotateZ(' + i * 6 + 'deg) translateY(-' + (oneMarkOffsetY - 3) + 'px)',
        }
      //endregion
      oneMDoms.push(
        <div style={oneStyle} key={'one'+i}></div>
      )
    }
    //endregion
    //endregion
    //region 先设置时间  再设置角度
    let currentHour = this.save.hour;
    let currentMinute = this.save.minute;
    // console.log('当前时间:',currentHour,currentMinute);

    //endregion
    //region 时针的dom
    let hourPointerWidth = 8;
    let hourPointerLong = clockSize / 2 / 2;
    let hourPointerOffsetX = (clockSize - hourPointerWidth) / 2;
    let hourPointerOffsetY = (clockSize - hourPointerLong) / 2;
    let hourAngle = 0;
    if (this.save.draggingPointer) {
      hourAngle = currentHour * 30 + currentMinute * 0.5;
    } else {
      hourAngle = time.hour * 30 + time.minute * 0.5;
    }


    let hourStyle =
      {
        borderRadius: hourPointerWidth / 2,
        position: 'absolute',
        left: hourPointerOffsetX,
        top: hourPointerOffsetY,
        width: hourPointerWidth,
        height: hourPointerLong,
        backgroundColor: '#cfeaa1',
        transform: 'rotateZ(' + hourAngle + 'deg) translateY(-' + ((hourPointerLong / 2) - hourPointerLong * 0.1) + 'px)',
        // transform:'rotateZ('+ (angle) + 'deg) translateY(-'+((hourPointerLong/2)-hourPointerLong*0.1)+'px)' ,
      }
    //endregion
    //region 分针的dom
    let minutePointerWidth = 4;
    let minutePointerLong = clockSize * 0.4;
    let minutePointerOffsetX = (clockSize - minutePointerWidth) / 2;
    let minutePointerOffsetY = (clockSize - minutePointerLong) / 2;
    let minuteAngle = 0;
    if (this.save.draggingPointer) {
      minuteAngle = currentMinute * 6;
    } else {
      minuteAngle = time.minute * 6;
    }
    let minuteStyle =
      {
        borderRadius: minutePointerWidth / 2,
        position: 'absolute',
        left: minutePointerOffsetX,
        top: minutePointerOffsetY,
        width: minutePointerWidth,
        height: minutePointerLong,
        backgroundColor: '#7bc0db',
        transform: 'rotateZ(' + minuteAngle + 'deg) translateY(-' + ((minutePointerLong / 2) - minutePointerLong * 0.1) + 'px)',
      }

    //是不是中午
    let isNoon = time.hour ===0 && round ===1;
    let hourText = ('' + (isNoon ? 12:time.hour)).padStart(2, '0');

    //region 显示文字形式的小时和分钟选择的时候,表盘显示为半透明加上filter:blur(5px)的效果
    if (showingSelector)
    {
      clockStyle.filter='blur(3px)';
      clockStyle.opacity = '40%';
    }
    //endregion
//region 下方的数字表的总样式
    let timeTextEditorHeight = this.props.numberClockSize?this.props.numberClockSize:defaultSetting.numberClockSize;
    let timeTextEditorRealStyle = {...this.timeTextEditor,
      width: controlSize,
      // minHeight: 70,
      height: timeTextEditorHeight,
      fontSize: timeTextEditorHeight*0.9,
      // fontSize:24,
      marginTop: timeTextEditorHeight,
      borderRadius: Math.round(timeTextEditorHeight/2),
      backgroundColor:this.props.backColor?this.props.backColor:defaultSetting.backColor,
      // border:'2px solid red',
      // cursor:'pointer',
    }
    //endregion
    //region 数字表进行选择时间时候的样式
    let textSelectorStyle =
      {
        // width: defaultSetting.clockSize,
        // height: defaultSetting.clockSize,
        width:'100%',
        height:'100%',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:this.props.backColor? this.props.backColor:defaultSetting.backColor,
      }
    const hourSelectorStyle =
      {
        ...textSelectorStyle,
        position: 'absolute',
        top: 0,
        left: 0,
        boxShadow: '0 0 1px 1px #cfeaa1 inset, 0 0 8px 1px #cfeaa1',
      }
    const minuteSelectorStyle =
      {
        ...textSelectorStyle,
        position: 'absolute',
        top: 0,
        left: 0,
        boxShadow: '0 0 1px 1px #7bc0db inset,0 0 8px 1px #7bc0db',
      }
    //endregion
    return (
      <div className={classes.container}
           onMouseDown={(event) => {
             if (!this.save.draggingPointer)
             {
               return;
             }
             this.save.moving=false;
           }}
           onMouseMove={event => {
             let newTime = this.handleMouseMove(event);
             if (newTime) {
               setTime(newTime);
               if (this.props.onChange)
               {
                 this.props.onChange(newTime);
               }
               if (newTime.round!== this.save.lastUpdateTime.round) {
                 setRound(newTime.round);
               }
               this.save.lastUpdateTime = newTime;
             }
           }}
           onMouseUp={event => {
             if (this.save.draggingPointer) {
               this.save.draggingPointer = null;
               this.save.moving = false;
             }
           }}
      >

        <div id={'表盘显示区域'} className={classes.main} style={{width:controlSize,height:clockSize}}>
          <div id={'表盘'}
            // hidden={showingSelector}
               style={clockStyle}
          >
            {quartersDom}
            {fiveMDoms}
            {oneMDoms}
            <div className={classes.pointer} style={hourStyle}
                 onMouseDown={event => {
                   this.getAndSaveCenterFunc();
                   this.setDraggingPointer('hour');
                   // let angle = getAngleByClientPoint(event.clientX, event.clientY);
                   // setMouseDownAngle(angle);
                   // setMouseMoveAngle(angle);
                 }}
              // onMouseUp={event=>setDraggingPointer(null)}
            />
            <div className={classes.pointer} style={minuteStyle}
                 onMouseDown={event => {
                   this.getAndSaveCenterFunc();
                   this.setDraggingPointer('minute');
                   // let angle = getAngleByClientPoint(event.clientX, event.clientY);
                   // setMouseDownAngle(angle);
                   // setMouseMoveAngle(angle);
                 }}
              // onMouseUp={event=>setDraggingPointer(null)}
            />
            <div className={classes.centerRed} style={centerRedStyle} id={'centerDom'}></div>
          </div>
          <div id={'信息显示器'} hidden={!debug} style={{position: 'fixed', top: '0', left: '0'}}>
            {/*<div> 按下位置:{mouseDownAngle}</div>*/}
            <div>移动中位置:{this.save.mouseMoveAngle}</div>
            {/*<div>角度差:{mouseMoveAngle-mouseDownAngle}</div>*/}
            <div>点击的指针:{this.save.draggingPointer}</div>
            <div>时间: {time.hour}:{time.minute}</div>
            <div>小时指针角度:{hourAngle}</div>
            <div>当前小时:{currentHour}</div>
            <div>当前分钟:{currentMinute}</div>
            <div>{msg}</div>
            <div>{JSON.stringify(this.save)}</div>
          </div>
          <div id={'小时选择区域'} hidden={showingSelector!=='hour'} className={classes.slowIn} style={hourSelectorStyle}>
            {this.getSelectorDom(0,12,3,4, hoverSelectorItem, setHoverSelectorItem,
              (selectedIndex)=>
              {
                let newTime = {...this.save.lastUpdateTime, hour:selectedIndex};
                setTime(newTime);
                if (this.props.onChange)
                {
                  this.props.onChange(newTime);
                }
                this.save.lastUpdateTime = newTime;
                this.save.hour = newTime.hour;
                this.save.minute = newTime.minute;
                setShowingSelector(null);
              }
            )}
          </div>
          <div id={'分钟选择区域'} hidden={showingSelector!=='minute'} className={classes.slowIn} style={minuteSelectorStyle}>
            {this.getSelectorDom(0,60,10,6, hoverSelectorItem, setHoverSelectorItem,
              (selectedIndex)=>
              {
                let newTime = {...this.save.lastUpdateTime, minute:selectedIndex};
                setTime(newTime);
                if (this.props.onChange)
                {
                  this.props.onChange(newTime);
                }
                this.save.lastUpdateTime = newTime;
                this.save.minute = newTime.minute;
                this.save.hour = newTime.hour;
                setShowingSelector(null);
              }
            )}</div>
        </div>

        <div id={'文字形式的时间显示区域'} style={timeTextEditorRealStyle}>
          <div id={'小时显示的文字'} className={classes.hour}
               onClick={event => {
                 console.log('点了小时显示文字');
                 setShowingSelector(showingSelector ==='hour'?null:'hour');
               }}
          >
            {hourText}
          </div>
          <div id={'冒号显示的文字'} className={classes.maoHao}>
            <div className={classes.maoHao1}></div>
            <div className={classes.maoHao2}></div>
          </div>
          <div id={'分钟显示的文字'} className={classes.minute}
               onClick={event => {
                 console.log('点了分钟,原来显示的是:', showingSelector)
                 setShowingSelector(showingSelector ==='minute'? null:'minute');
               }}
          >{('' + time.minute).padStart(2, '0')}</div>
          <div className={classes.rounds}>
            <div className={round=== 0 ? classes.roundSelected : classes.round}
                 onClick={event => {
                   let newTime = {...this.save.lastUpdateTime, round:0};
                   setRound(0);
                   if (this.props.onChange)
                   {
                     this.props.onChange(newTime);
                   }
                 }}
            >上午</div>
            <div className={round === 1 ? classes.roundSelected : classes.round}
                 onClick={event => {
                   let newTime = {...this.save.lastUpdateTime, round:1};
                   setRound(1);
                   if (this.props.onChange)
                   {
                     this.props.onChange(newTime);
                   }
                 }}
            >下午</div>
          </div>
        </div>
      </div>
    );
  }
}

export default TimeSelector;
