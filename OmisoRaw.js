javascript:
{
    window.translator = {
        state: 1,
        over: null,
        target: null,
        hover: function(e) {
            if(translator.target == null || !translator.target.isEqualNode(translator.getP(e.target))){
                if(translator.state == 2){
                    translator.reset(e);
                }
                translator.target = translator.getP(e.target);
                translator.over=document.createElement("div");
                translator.over.appendChild(document.createTextNode("翻訳"));
                translator.over.style="cursor:pointer;color:rgba(255,255,255,0.5);position:fixed;z-index:2147483647;background-color:rgba(0,0,0,0.5);border-radius:5px;padding:4px 10px;";
                document.body.appendChild(translator.over);
                rect = translator.target.getBoundingClientRect();
                overS=translator.over.style;
                overS.right = (document.body.clientWidth - rect.right)+"px";
                overS.top = rect.top+"px";
                translator.state = 2;
                translator.over.addEventListener("mouseup", function(e){
                    text = encodeURIComponent(translator.target.innerText);
                    text = text.replace(/%2F/g, "%5C%2F");
                    window.open("https://www.deepl.com/translator#en/ja/"+text);
                });
            }
        },
        reset: function(e) {
            document.body.removeChild(translator.over);
            translator.target = null;
            translator.state=1;
        },
        getP: function(p){
            if(p.tagName == "P"){
                return p;
            }else{
                return translator.getP(p.parentNode);
            }
        }
    };
    p = document.getElementsByTagName("p");
    for(i = 0; i < p.length; i++){
        p[i].addEventListener("mouseover", function(e){
            translator.hover(e);
        });
    }
    window.addEventListener("scroll", function(e) {
        translator.reset(e);
    });
}