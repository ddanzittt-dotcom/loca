const { useState, useRef, useEffect, useCallback } = React;

const uid = () => "x" + Math.random().toString(36).slice(2, 7);

const TH = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6"];
const MO = ["😊", "🥰", "😋", "🤩", "😌"];
const GR = [
  ["#667eea","#764ba2"],["#f093fb","#f5576c"],["#4facfe","#00f2fe"],
  ["#43e97b","#38f9d7"],["#fa709a","#fee140"],["#a18cd1","#fbc2eb"],
  ["#fccb90","#d57eeb"],["#e0c3fc","#8ec5fc"],["#f5576c","#ff6a88"]
];

const PPL = [
  {id:"u1",name:"서울숲러버",handle:"@seongsu_lover",emoji:"🧑‍🎨",bio:"성수동 카페 전문 크리에이터 ☕",type:"creator",maps:12,followers:1240,following:89,verified:true},
  {id:"u2",name:"제주탐험대",handle:"@jeju_explore",emoji:"🏝️",bio:"제주도 구석구석 탐험 기록",type:"creator",maps:8,followers:3200,following:156,verified:true},
  {id:"u3",name:"김민지",handle:"@minji_food",emoji:"👩",bio:"맛집 투어가 취미!",type:"friend",maps:3,followers:45,following:120,verified:false},
  {id:"u4",name:"부여군",handle:"@buyeo_gun",emoji:"🏯",bio:"백제의 숨결이 살아있는 부여군 공식",type:"org",maps:6,followers:2800,following:35,verified:true},
  {id:"u5",name:"공주시",handle:"@gongju_city",emoji:"👑",bio:"공주시 관광·문화 공식 계정",type:"org",maps:8,followers:3400,following:28,verified:true},
  {id:"u6",name:"올드서울",handle:"@oldseoul",emoji:"📸",bio:"을지로·종로 레트로 감성",type:"creator",maps:15,followers:5600,following:201,verified:true},
  {id:"u7",name:"박서연",handle:"@hiking_yeon",emoji:"👩‍🦰",bio:"등산·트레킹 지도 제작",type:"friend",maps:6,followers:180,following:95,verified:false},
  {id:"u8",name:"천안문화재단",handle:"@ca_culture",emoji:"🎭",bio:"천안 문화예술 진흥 공식 계정",type:"org",maps:7,followers:1900,following:45,verified:true},
  {id:"u9",name:"카페투어러",handle:"@cafe_tourer",emoji:"☕",bio:"전국 감성카페 리뷰어",type:"creator",maps:20,followers:8900,following:312,verified:true},
  {id:"u10",name:"이준호",handle:"@junho_dev",emoji:"👨‍💻",bio:"개발자의 작업 카페 지도",type:"friend",maps:2,followers:67,following:88,verified:false},
];

const IM = [
  {id:"m1",title:"성수동 탐험",desc:"성수 일대 감성 장소들",theme:"#6366F1",own:true},
  {id:"m2",title:"제주 여행",desc:"제주도 맛집·뷰포인트",theme:"#22C55E",own:true},
  {id:"m3",title:"서울 야경 스팟",desc:"서울에서 밤이 예쁜 곳",theme:"#8B5CF6",own:false,from:"@oldseoul"},
  {id:"m4",title:"혼밥 맛집 12곳",desc:"solo_foodie님의 지도",theme:"#EF4444",own:false,from:"@solo_foodie"}
];

const IF = [
  {id:"f1",mid:"m1",ty:"pin",tl:"블루보틀 성수",em:"☕",hl:true,lng:127.056,lat:37.544,tags:["커피"],logs:[{id:"l1",d:"2026-03-14",n:"오트밀크 라떼 최고!",m:"😋"}]},
  {id:"f2",mid:"m1",ty:"pin",tl:"서울숲",em:"🌳",hl:false,lng:127.038,lat:37.544,tags:["산책"],logs:[]},
  {id:"f3",mid:"m1",ty:"pin",tl:"대림창고",em:"🏭",hl:false,lng:127.058,lat:37.543,tags:["카페"],logs:[]},
  {id:"f4",mid:"m1",ty:"line",tl:"성수→뚝섬",em:"🚶",hl:false,pts:[[127.044,37.543],[127.048,37.54],[127.052,37.536]],tags:[],logs:[]},
  {id:"f5",mid:"m2",ty:"pin",tl:"협재해변",em:"🏖️",hl:true,lng:126.239,lat:33.394,tags:["바다"],logs:[{id:"l5",d:"2026-02-20",n:"에메랄드빛 바다!",m:"🤩"}]},
  {id:"f6",mid:"m2",ty:"pin",tl:"흑돼지거리",em:"🍽️",hl:false,lng:126.531,lat:33.51,tags:["맛집"],logs:[]},
  {id:"f7",mid:"m3",ty:"pin",tl:"남산타워",em:"🌙",hl:true,lng:126.988,lat:37.551,tags:["야경"],logs:[]},
  {id:"f8",mid:"m3",ty:"pin",tl:"반포대교",em:"🌉",hl:false,lng:126.995,lat:37.510,tags:["야경"],logs:[]},
  {id:"f9",mid:"m4",ty:"pin",tl:"혼밥식당 을지로점",em:"🍜",hl:true,lng:126.992,lat:37.566,tags:["맛집"],logs:[]},
  {id:"f10",mid:"m4",ty:"pin",tl:"1인 샤브샤브",em:"🍲",hl:false,lng:126.985,lat:37.570,tags:["맛집"],logs:[]},
];

const IS = [
  {id:"s1",mapId:"m1",date:"2026-03-12",likes:24,saves:8,caption:"성수동 카페 투어 완료! ☕"},
  {id:"s2",mapId:"m2",date:"2026-02-25",likes:67,saves:19,caption:"제주도 3박4일 코스 🏖️"}
];

const B = {border:"none",padding:"10px 14px",borderRadius:12,fontSize:12,fontWeight:800,cursor:"pointer",background:"#6366F1",color:"#fff"};
const BO = {border:"1px solid #E5E7EB",padding:"10px 14px",borderRadius:12,fontSize:12,fontWeight:800,cursor:"pointer",background:"#fff",color:"#6B7280"};
const BD = {border:"1px solid #FECACA",padding:"10px 14px",borderRadius:12,fontSize:12,fontWeight:800,cursor:"pointer",background:"#FEF2F2",color:"#EF4444"};
const INP = {width:"100%",borderRadius:12,border:"1px solid #E5E7EB",padding:"10px 12px",fontSize:13,fontWeight:700,outline:"none",boxSizing:"border-box"};
const SHT = {position:"fixed",bottom:0,left:0,right:0,maxWidth:430,margin:"0 auto",background:"#fff",borderRadius:"20px 20px 0 0",boxShadow:"0 -12px 30px rgba(0,0,0,.15)",maxHeight:"82vh",overflowY:"auto",padding:"12px 16px 24px",zIndex:9999};