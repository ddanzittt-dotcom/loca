function App(){
  const[maps,setMaps]=useState(IM);
  const[feats,setFeats]=useState(IF);
  const[shared,setShared]=useState(IS);
  const[tab,setTab]=useState("home");
  const[oMap,setOMap]=useState(null);
  const[sheet,setSheet]=useState(null);
  const[sel,setSel]=useState(null);
  const[dm,setDm]=useState(null);
  const[draft,setDraft]=useState([]);
  const[toast,setToast]=useState("");
  const[fT,setFT]=useState("");
  const[fTg,setFTg]=useState("");
  const[fH,setFH]=useState(false);
  const[ln,setLn]=useState("");
  const[lm,setLm]=useState("");
  const[nT,setNT]=useState("");
  const[nD,setND]=useState("");
  const[nTh,setNTh]=useState(TH[0]);
  const[renId,setRenId]=useState(null);
  const[sq,setSq]=useState("");
  const[profView,setProfView]=useState(null);
  const[pubCap,setPubCap]=useState("");
  const[searchQ,setSearchQ]=useState("");
  const[sFilter,setSFilter]=useState("all");
  const[followed,setFollowed]=useState(["u1","u5"]);
  const[viewUser,setViewUser]=useState(null);
  const[listMap,setListMap]=useState("all");

  const tt=msg=>{ setToast(msg); setTimeout(()=>setToast(""),2200); };

  const am  = oMap ? maps.find(m=>m.id===oMap) : null;
  const mf  = oMap ? feats.filter(f=>f.mid===oMap) : [];
  const sf  = sel  ? feats.find(f=>f.id===sel)  : null;

  const openDet=f=>{
    setSel(f.id); setSheet("det");
    setFT(f.tl); setFTg((f.tags||[]).join(", ")); setFH(!!f.hl); setLn(""); setLm("");
  };
  const saveDet=()=>{
    setFeats(p=>p.map(f=>f.id===sel?{...f,tl:fT||f.tl,tags:fTg.split(",").map(x=>x.trim()).filter(Boolean),hl:fH}:f));
    tt("저장 ✅");
  };
  const addLog=()=>{
    if(!ln.trim()){ tt("메모를 입력하세요"); return; }
    setFeats(p=>p.map(f=>f.id===sel?{...f,logs:[...(f.logs||[]),{id:uid(),d:new Date().toISOString().slice(0,10),n:ln,m:lm}]}:f));
    setLn(""); setLm(""); tt("로그 추가 ✅");
  };
  const delLog=lid=>setFeats(p=>p.map(f=>f.id===sel?{...f,logs:(f.logs||[]).filter(l=>l.id!==lid)}:f));
  const delFeat=()=>{ setFeats(p=>p.filter(f=>f.id!==sel)); setSheet(null); setSel(null); };

  const onMapC=useCallback(c=>{
    if(dm==="pin"){
      const nf={id:uid(),mid:oMap,ty:"pin",tl:"새 장소",em:"📍",hl:false,lng:c.lng,lat:c.lat,tags:[],logs:[]};
      setFeats(p=>[...p,nf]); setDm(null); openDet(nf); tt("📍 핀 추가됨");
    } else if(dm==="line"||dm==="area"){
      setDraft(p=>[...p,[c.lng,c.lat]]);
    }
  },[dm,oMap]);

  const finLine=()=>{
    if(draft.length<2){ tt("2점 이상 필요"); return; }
    const nf={id:uid(),mid:oMap,ty:"line",tl:"새 경로",em:"🔀",hl:false,pts:[...draft],tags:[],logs:[]};
    setFeats(p=>[...p,nf]); setDraft([]); setDm(null); openDet(nf);
  };

  const finArea=()=>{
    if(draft.length<3){ tt("3점 이상 필요"); return; }
    const nf={id:uid(),mid:oMap,ty:"area",tl:"새 범위",em:"🔷",hl:false,pts:[...draft],tags:[],logs:[]};
    setFeats(p=>[...p,nf]); setDraft([]); setDm(null); openDet(nf);
  };

  const crMap=()=>{
    if(!nT.trim()){ tt("이름을 입력하세요"); return; }
    const nm={id:uid(),title:nT,desc:nD,theme:nTh,own:true};
    setMaps(p=>[...p,nm]); setSheet(null); setOMap(nm.id); tt("지도 생성 ✨");
  };

  const svRen=()=>{
    setMaps(p=>p.map(m=>m.id===renId?{...m,title:nT||m.title,desc:nD,theme:nTh}:m));
    setSheet(null); tt("저장 ✅");
  };

  const dlMap=()=>{
    setFeats(p=>p.filter(f=>f.mid!==renId));
    setMaps(p=>p.filter(m=>m.id!==renId));
    setOMap(null); setSheet(null);
  };

  const pubMap=mid=>{
    if(shared.some(s=>s.mapId===mid)){ tt("이미 공유중"); return; }
    setShared(p=>[{id:uid(),mapId:mid,date:new Date().toISOString().slice(0,10),likes:0,saves:0,caption:pubCap},...p]);
    setSheet(null); setPubCap(""); tt("프로필에 공유! 🎉");
  };

  const unpub=sid=>{
    setShared(p=>p.filter(s=>s.id!==sid));
    setProfView(null);
    tt("공유 해제");
  };

  const togFollow=uid2=>setFollowed(p=>p.includes(uid2)?p.filter(x=>x!==uid2):[...p,uid2]);

  const fPeople=PPL.filter(u=>{
    const q=searchQ.toLowerCase();
    return (
      (!q || u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q)) &&
      (sFilter==="all" || u.type===sFilter)
    );
  });

  const drawTools=[
    {m:"pin",e:"📍",l:"핀"},
    {m:"line",e:"🔀",l:"경로"},
    {m:"area",e:"🔷",l:"범위"},
  ];
  const activeDraw=dm==="line"||dm==="area";
  const finDraw=dm==="line"?finLine:finArea;
  const minPts=dm==="line"?2:3;

  return (
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto",background:"#F8F7FF",overflow:"hidden"}}>
      {/* 여기에 네가 보낸 기존 JSX 전체를 그대로 넣으면 됨 */}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);