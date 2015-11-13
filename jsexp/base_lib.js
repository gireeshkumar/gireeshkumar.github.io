function toExp(e){
	var n=" ";
	return n+=e.left+" "+e.operator+" "+e.right
}
function isNested(expobj){
    return "undefined" !=typeof expobj.type && "undefined"!=typeof expobj.exp;
}
function genJS(e){
    var isarray = Array.isArray(e.exp);
    
    if(isarray){
         for(var n="",t=[],o=0;o<e.exp.length;o++){
            var r=e.exp[o];
             if( isNested(r)){
                 t.push(" ("+genJS(r)+") ");
             }else{
                 t.push(toExp(r))
             }
        }
        return n += t.join(e.exp.length > 1 ? " " + ( "and"==e.type?"&&":"||" ) + " ":" ")
    }else{
        var isnested = isNested( e.exp );
        if(isnested){
           return " ("+genJS(e.exp)+") "
        }else{
            return toExp(e.exp);
        }
    }
}
function generateJS(e){
	return"if("+genJS(e)+") {return "+e.rslt+";}"
}

function evalExpressionObj(expObj,params){
    console.log("evalExpressionObj");
    console.log("metadata:");console.log(expObj);
    console.log("Params:");console.log(params);
    
    var fnc = expObj.func;
    var paramkeys = expObj.params;
    var config = expObj.config;
   
    var arr = [config];
    if(typeof params != "undefined" && params != null){
        for(var i = 0; i < paramkeys.length; i++){
            var property = paramkeys[i];
            if (params.hasOwnProperty(property)) {
               arr.push(params[property]);
            }else{
                arr.push(null);
            }
        }
    }
    
    return ( EvelLib[fnc]).apply (null, arr);   
    
}

//// Libs ///
EvelLib = {
    genExpImpl : function(cnf){
        var exp = "";
        for(var i = 0; i < cnf.length; i++){           
            exp += ' '+generateJS(cnf[i]);
        }
        return exp;
    },
    genNumber : function(cnf, input){       
        return new Function('input', EvelLib.genExpImpl(cnf) )(input);
    },
    genNumberND : function(cnf, input){     
        return new Function('rate','num','denom',EvelLib.genExpImpl(cnf) )(input);
    },
	multichoice : function(config,input){
        console.log("config:"+config);
        console.log("input:"+input);
		var rslt = config[input];
		return (null == rslt || "undefined" == typeof rslt) ? 0 : rslt;
	},
    validData : function(conifg, input){
        if(typeof input !== "undefined" && input != null){
            return conifg.rslt;
        }else{
            return 0;
        }
    },
    testfn : function(config,input, r, x){
        console.log("config:"+config);
        console.log("input:"+input);
         console.log("r:"+r);
         console.log("x:"+x);
        return null;
	}
}
