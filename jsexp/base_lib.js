function toExp(e){
	var n=" ";
	var isvar = false;
	var varname = null;
	if(typeof e.right === "string"){
		if((e.right.startsWith("${{") && e.right.endsWith("}}"))){
			//right value is a variable
			isvar = true;
			varname = e.right.substring(3, e.right.length-2);
		}
	}
	return n+=e.left+" "+e.operator+" "+ (isvar ? varname : (typeof e.right === "string" ? ('"'+e.right+'"') : e.right));
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
    if(e.rslt === null || typeof e.rslt === "undefined"){
        return genJS(e);
    }else{
        return"if("+genJS(e)+") {return '"+e.rslt+"';}"
    }
	
}

function evalDirectExpression(expObj,params){
    
}

function evalExpressionObj(expObj,params){
    console.log("evalExpressionObj");
    console.log("metadata:");console.log(expObj);
    console.log("Params:");console.log(params);
    
    var fnc = expObj.func;
    var paramkeys = expObj.params;
    var config = expObj.config;
   
    var arr = [];
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
    if(fnc === "evaluate"){
         return EvelLib.evaluate(config, paramkeys, arr);
    }else{
         return ( EvelLib[fnc]).apply (null, [config, arr]);   
    }
   
    
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
        var rslt = new Function('input', EvelLib.genExpImpl(cnf) ).apply(null,input);
    	return (null == rslt || "undefined" == typeof rslt) ? 0 : rslt;
    },
    genNumberND : function(cnf, input){     
        var rslt = new Function('rate','num','denom','input',EvelLib.genExpImpl(cnf) ).apply(null,input);
	return (null == rslt || "undefined" == typeof rslt) ? 0 : rslt;
    },
    evaluate: function(cnf, params, input){
        console.log(cnf);console.log(params);console.log(input);
        
         var rslt = new Function(params, "return (" + EvelLib.genExpImpl(cnf) + " );").apply(null, input);
         return (typeof rslt === "undefined" ? false : rslt);
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
