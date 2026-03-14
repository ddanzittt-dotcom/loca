function MapView({feats, theme, drawMode, onMapClick, onPinClick, draft, onToast}){
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);
  const featLayerRef  = useRef(null);
  const draftLayerRef = useRef(null);
  const locMarkerRef  = useRef(null);
  const initialFit    = useRef(false);
  const [locBusy, setLocBusy] = useState(false);

  const dmRef    = useRef(drawMode);
  const clickRef = useRef(onMapClick);
  const pinRef   = useRef(onPinClick);

  useEffect(()=>{ dmRef.current=drawMode; },[drawMode]);
  useEffect(()=>{ clickRef.current=onMapClick; },[onMapClick]);
  useEffect(()=>{ pinRef.current=onPinClick; },[onPinClick]);

  useEffect(()=>{
    const el = containerRef.current;
    if(!el || mapRef.current) return;

    const L = window.L;
    const map = L.map(el,{zoomControl:false,attributionControl:false}).setView([37.544,127.048],14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
    L.control.zoom({position:'bottomright'}).addTo(map);

    featLayerRef.current = L.layerGroup().addTo(map);
    draftLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    map.on('click', e=>{
      if(dmRef.current) clickRef.current({lng:e.latlng.lng, lat:e.latlng.lat});
    });

    const fix = ()=>map.invalidateSize();
    setTimeout(fix,0);
    setTimeout(fix,150);
    setTimeout(fix,500);

    return ()=>{
      map.remove();
      mapRef.current = null;
      featLayerRef.current = null;
      draftLayerRef.current = null;
    };
  },[]);

  useEffect(()=>{
    const lg = featLayerRef.current;
    const map = mapRef.current;
    if(!lg || !map) return;

    const L = window.L;
    lg.clearLayers();
    const bounds = [];

    feats.forEach(f=>{
      if(f.ty==="pin"){
        const ll=[f.lat,f.lng];
        bounds.push(ll);

        const ic=L.divIcon({
          html:`<div style="width:34px;height:34px;border-radius:17px;background:${f.hl?theme:"#fff"};border:2.5px solid ${theme};display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(0,0,0,.25);cursor:pointer">${f.em}</div>`,
          className:"",iconSize:[34,34],iconAnchor:[17,17]
        });

        L.marker(ll,{icon:ic}).addTo(lg)
          .on('click',e=>{ L.DomEvent.stopPropagation(e); pinRef.current(f); });
      }

      if(f.ty==="line" && f.pts){
        const lls=f.pts.map(p=>[p[1],p[0]]);
        lls.forEach(l=>bounds.push(l));

        L.polyline(lls,{color:theme,weight:4,opacity:.85}).addTo(lg)
          .on('click',e=>{ L.DomEvent.stopPropagation(e); pinRef.current(f); });

        if(lls.length){
          const ic2=L.divIcon({
            html:`<div style="width:24px;height:24px;border-radius:12px;background:${theme};display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,.2)">${f.em}</div>`,
            className:"",iconSize:[24,24],iconAnchor:[12,12]
          });

          L.marker(lls[0],{icon:ic2}).addTo(lg)
            .on('click',e=>{ L.DomEvent.stopPropagation(e); pinRef.current(f); });
        }
      }

      if(f.ty==="area" && f.pts){
        const lls=f.pts.map(p=>[p[1],p[0]]);
        lls.forEach(l=>bounds.push(l));

        const pg=L.polygon(lls,{color:theme,weight:2,fillColor:theme,fillOpacity:.18}).addTo(lg);
        pg.on('click',e=>{ L.DomEvent.stopPropagation(e); pinRef.current(f); });

        const center=pg.getBounds().getCenter();
        const ic3=L.divIcon({
          html:`<div style="width:28px;height:28px;border-radius:14px;background:${theme};display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.2)">${f.em}</div>`,
          className:"",iconSize:[28,28],iconAnchor:[14,14]
        });

        L.marker([center.lat,center.lng],{icon:ic3}).addTo(lg)
          .on('click',e=>{ L.DomEvent.stopPropagation(e); pinRef.current(f); });
      }
    });

    if(!initialFit.current && bounds.length){
      try{
        map.fitBounds(bounds,{padding:[48,48],maxZoom:16,animate:false});
      }catch(e){}
      initialFit.current=true;
    }
  },[feats,theme]);

  useEffect(()=>{
    const dl=draftLayerRef.current;
    if(!dl) return;

    const L=window.L;
    dl.clearLayers();

    if(!draft || !draft.length) return;

    draft.forEach((p,i)=>{
      const ic=L.divIcon({
        html:`<div style="width:20px;height:20px;border-radius:10px;background:${theme};border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.3)">${i+1}</div>`,
        className:"",iconSize:[20,20],iconAnchor:[10,10]
      });
      L.marker([p[1],p[0]],{icon:ic}).addTo(dl);
    });

    if(draft.length>=2){
      L.polyline(draft.map(p=>[p[1],p[0]]),{color:theme,weight:3,dashArray:"8 5",opacity:.7}).addTo(dl);
    }

    if(drawMode==="area" && draft.length>=3){
      L.polygon(draft.map(p=>[p[1],p[0]]),{color:theme,weight:2,fillColor:theme,fillOpacity:.12,dashArray:"6 4"}).addTo(dl);
    }
  },[draft,theme,drawMode]);

  useEffect(()=>{
    const el=containerRef.current;
    if(el) el.style.cursor=drawMode?"crosshair":"grab";
    if(mapRef.current) mapRef.current.invalidateSize();
  },[drawMode]);

  const handleLocate=()=>{
    if(!navigator.geolocation){
      onToast("위치 권한을 허용해주세요");
      return;
    }

    setLocBusy(true);
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const {latitude:lat, longitude:lng}=pos.coords;
        const map=mapRef.current;
        const L=window.L;
        if(!map || !L){
          setLocBusy(false);
          return;
        }

        if(locMarkerRef.current){
          locMarkerRef.current.remove();
          locMarkerRef.current=null;
        }

        const ic=L.divIcon({
          html:`<div style="width:18px;height:18px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,.3)"></div>`,
          className:"",iconSize:[18,18],iconAnchor:[9,9]
        });

        locMarkerRef.current=L.marker([lat,lng],{icon:ic,zIndexOffset:1000})
          .addTo(map)
          .bindPopup("📍 현재 내 위치",{closeButton:false,offset:[0,-6]})
          .openPopup();

        map.flyTo([lat,lng],16,{animate:true,duration:1.2});
        setLocBusy(false);
        onToast("📍 내 위치로 이동했어요");
      },
      err=>{
        setLocBusy(false);
        onToast(err.code===1 ? "위치 권한을 허용해주세요" : "위치를 가져올 수 없어요");
      },
      {enableHighAccuracy:true, timeout:8000}
    );
  };

  return (
    <div style={{width:"100%",height:"100%",position:"relative"}}>
      <div ref={containerRef} style={{width:"100%",height:"100%"}} />

      <button
        onClick={handleLocate}
        style={{
          position:"absolute",top:10,right:10,zIndex:500,
          width:48,borderRadius:12,
          border:`2px solid ${locBusy?"#3B82F6":"#E5E7EB"}`,
          background:locBusy?"#EFF6FF":"rgba(255,255,255,.96)",
          cursor:"pointer",fontSize:18,
          display:"flex",flexDirection:"column",alignItems:"center",
          padding:"7px 4px",gap:1,
          boxShadow:"0 2px 6px rgba(0,0,0,.1)"
        }}
      >
        {locBusy?"⏳":"🎯"}
        <span style={{fontSize:8,fontWeight:800,color:locBusy?"#3B82F6":"#6B7280"}}>내위치</span>
      </button>
    </div>
  );
}

function MapThumb({map,feats,size,idx}){
  const g=GR[(idx||0)%GR.length];
  const pins=feats.filter(f=>f.ty==="pin");
  const big=typeof size==="number" && size>120;

  return(
    <div style={{width:size,height:size,borderRadius:4,background:`linear-gradient(135deg,${g[0]},${g[1]})`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-15,right:-15,width:60,height:60,borderRadius:"50%",background:"rgba(255,255,255,.12)"}} />
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",flexWrap:"wrap",gap:2,padding:8,height:"calc(100% - 28px)"}}>
        {pins.slice(0,4).map((f,i)=>(
          <span key={i} style={{fontSize:big?28:18,filter:"drop-shadow(0 2px 4px rgba(0,0,0,.2))",transform:`rotate(${(i-1.5)*8}deg)`}}>
            {f.em}
          </span>
        ))}
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,.35)",padding:"4px 7px"}}>
        <div style={{fontSize:big?11:8,fontWeight:800,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
          {map.title}
        </div>
      </div>
    </div>
  );
}