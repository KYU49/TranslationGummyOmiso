class Translator{
    static id = 0;
    static list = {};
    static timer = null;
    constructor(p) {
        this.localhostEnable = true;
        this.p = p;
        this.id = -1;
        this.original = p.innerHTML;
        this.hash = this.simpleHash(this.original);
        this.translate = "翻訳中";
        this.translated = false;
        this.called = false;
        this.init();
    }
    init(){
        this.tranlatorId = Translator.id++;
        Translator.list[this.tranlatorId] = this;
        this.p.setAttribute("translatorId", String(this.tranlatorId));
        if(this.tranlatorId < 5 || localStorage.getItem(this.hash) != null){
            this.sendTranslate();
        }
    }
    callback(result){
        if(Translator.timer != null){
            clearTimeout(Translator.timer);
            Translator.timer = null;
        }
        if(result.length > 0){
            this.translate = result;
            this.translated = false;
            localStorage.setItem(this.hash, result);
            this.switch();
        }else{
            alert("DeepLの翻訳上限に達した可能性があります。");
        }
    }
    switch(){
        this.sendTranslate();
        if(this.translated){
            this.p.innerHTML = this.original;
        }else{
            this.p.innerText = this.translate;
        }
        this.translated = !this.translated;
    }
    sendTranslate(){
        if(this.called){
            return;
        }
        if(Translator.timer == null){
        Translator.timer = setTimeout(function(){
                alert("OmisoServer.ps1が応答していない可能性があります。");
            }, 30000);
        }
        let savedValue = localStorage.getItem(this.hash);
        this.called = true;
        if(savedValue == null){
            let url = this.localhostEnable?"http://localhost:8000/?":"http://127.0.0.1/Temporary_Listen_Addresses/?";
            let script = document.createElement("script");
            script.type = 'text/javascript';
            script.src = url + encodeURIComponent(this.p.innerText).replace(/%2F/g, "%5C%2F") + "&" + this.tranlatorId;
            document.body.appendChild(script);
        }else{
            this.callback(savedValue);
        }
    }
    simpleHash(str){
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash &= hash;
        }
        return new Uint32Array([hash])[0].toString(36);
    }
}

let capsule=new class{
    constructor(){
        this.init();
    }
    init(){
        window.button = {
            over: null,
            target: null,
            hover: function(e) {
                let tempTarget = button.getP(e.target);
                if(button.target == null || !button.target.isEqualNode(tempTarget)){
                    if(button.target != null){
                        button.reset();
                    }
                    if(button.over == null){
                        button.over = document.createElement("div");
                        button.over.appendChild(document.createTextNode("🔄"));
                        button.over.style = "cursor:pointer;position:fixed;z-index:2147483647;opacity:0.5;";
                        button.over.addEventListener("mouseup", function(e){
                            let id = Number(button.target.getAttribute("translatorId"));
                            Translator.list[id].switch();
                        });
                    }
                    button.target = tempTarget;
                    
                    let tempId = Number(button.target.getAttribute("translatorId"));
                    let tempTranslator = Translator.list[tempId];
                    tempTranslator.sendTranslate();
                    if((tempId + 1) in Translator.list){
                        Translator.list[tempId + 1].sendTranslate();
                    }

                    document.body.appendChild(button.over);

                    let rect = button.target.getBoundingClientRect();
                    let overS = button.over.style;
                    overS.right = (document.body.clientWidth - rect.right)+"px";
                    overS.top = rect.top+"px";
                }
            },
            reset: function() {
                if(button.over != null && button.over.parentNode){ 
                    document.body.removeChild(button.over);
                }
                button.target = null;
                button.state=1;
            },
            getP: function(p){
                if(p.tagName == "P"){
                    return p;
                }else{
                    return button.getP(p.parentNode);
                }
            }
        };
        let p = document.getElementsByTagName("p");
        for(let i = 0; i < p.length; i++){
            if(p[i].innerText.length > 200){
                let t = new Translator(p[i]);
                p[i].addEventListener("mouseover", function(e){
                    button.hover(e);
                });
            }
        }
        window.addEventListener("scroll", function(e) {
            button.reset();
        });
    }
    callback(response){
        Translator.list[response.translationId].callback(response.result);
    }
};
function callback(response){
    capsule.callback(response);
}