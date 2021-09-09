class Translator{
    static id = 0;
    static list = {};
    constructor(p) {
        this.localhostEnable = true;
        this.p = p;
        this.original = p.innerHTML;
        this.translate = "翻訳中";
        this.translated = false;
        this.init();
    }
    init(){
        let tranlatorId = Translator.id++;
        Translator.list[tranlatorId] = this;
        this.p.setAttribute("translationId", String(tranlatorId));
        this.sendTranslate(this.p.innerText, tranlatorId);
    }
    callback(result){
        this.translate = result;
        this.translated = false;
        this.switch();
    }
    switch(){
        if(this.translated){
            this.p.innerHTML = this.original;
        }else{
            this.p.innerText = this.translate;
        }
        this.translated = !this.translated;
    }
    sendTranslate(text, translationId){
        let url = this.localhostEnable?"http://localhost:8000/?":"http://+:80/Temporary_Listen_Addresses/?";
        let script = document.createElement("script");
        script.type = 'text/javascript';
        script.src = url + encodeURIComponent(text).replace(/%2F/g, "%5C%2F") + "&" + translationId;
        document.body.appendChild(script);
    }
}
capsule=new class{
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
                            let id = Number(button.target.getAttribute("translationId"));
                            Translator.list[id].switch();
                        });
                    }
                    button.target = tempTarget;
                    document.body.appendChild(button.over);

                    let rect = button.target.getBoundingClientRect();
                    let overS = button.over.style;
                    overS.right = (document.body.clientWidth - rect.right)+"px";
                    overS.top = rect.top+"px";
                }
            },
            reset: function() {
                if(button.over.parentNode){ 
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
            let t = new Translator(p[i]);
            p[i].addEventListener("mouseover", function(e){
                button.hover(e);
            });
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