function Resampler(t,e,r,i,a){this.fromSampleRate=t,this.toSampleRate=e,this.channels=0|r,this.outputBufferSize=i,this.noReturn=!!a,this.initialize()}Resampler.prototype.initialize=function(){if(!(this.fromSampleRate>0&&this.toSampleRate>0&&this.channels>0))throw new Error("Invalid settings specified for the resampler.");this.fromSampleRate==this.toSampleRate?(this.resampler=this.bypassResampler,this.ratioWeight=1):(this.compileInterpolationFunction(),this.resampler=this.interpolate,this.ratioWeight=this.fromSampleRate/this.toSampleRate,this.tailExists=!1,this.lastWeight=0,this.initializeBuffers())},Resampler.prototype.compileInterpolationFunction=function(){for(var t="var bufferLength = Math.min(buffer.length, this.outputBufferSize);\tif ((bufferLength % "+this.channels+") == 0) {\t\tif (bufferLength > 0) {\t\t\tvar ratioWeight = this.ratioWeight;\t\t\tvar weight = 0;",e=0;e<this.channels;++e)t+="var output"+e+" = 0;";for(t+="var actualPosition = 0;\t\t\tvar amountToNext = 0;\t\t\tvar alreadyProcessedTail = !this.tailExists;\t\t\tthis.tailExists = false;\t\t\tvar outputBuffer = this.outputBuffer;\t\t\tvar outputOffset = 0;\t\t\tvar currentPosition = 0;\t\t\tdo {\t\t\t\tif (alreadyProcessedTail) {\t\t\t\t\tweight = ratioWeight;",e=0;e<this.channels;++e)t+="output"+e+" = 0;";for(t+="}\t\t\t\telse {\t\t\t\t\tweight = this.lastWeight;",e=0;e<this.channels;++e)t+="output"+e+" = this.lastOutput["+e+"];";for(t+="alreadyProcessedTail = true;\t\t\t\t}\t\t\t\twhile (weight > 0 && actualPosition < bufferLength) {\t\t\t\t\tamountToNext = 1 + actualPosition - currentPosition;\t\t\t\t\tif (weight >= amountToNext) {",e=0;e<this.channels;++e)t+="output"+e+" += buffer[actualPosition++] * amountToNext;";for(t+="currentPosition = actualPosition;\t\t\t\t\t\tweight -= amountToNext;\t\t\t\t\t}\t\t\t\t\telse {",e=0;e<this.channels;++e)t+="output"+e+" += buffer[actualPosition"+(e>0?" + "+e:"")+"] * weight;";for(t+="currentPosition += weight;\t\t\t\t\t\tweight = 0;\t\t\t\t\t\tbreak;\t\t\t\t\t}\t\t\t\t}\t\t\t\tif (weight == 0) {",e=0;e<this.channels;++e)t+="outputBuffer[outputOffset++] = output"+e+" / ratioWeight;";for(t+="}\t\t\t\telse {\t\t\t\t\tthis.lastWeight = weight;",e=0;e<this.channels;++e)t+="this.lastOutput["+e+"] = output"+e+";";t+='this.tailExists = true;\t\t\t\t\tbreak;\t\t\t\t}\t\t\t} while (actualPosition < bufferLength);\t\t\treturn this.bufferSlice(outputOffset);\t\t}\t\telse {\t\t\treturn (this.noReturn) ? 0 : [];\t\t}\t}\telse {\t\tthrow(new Error("Buffer was of incorrect sample length."));\t}',this.interpolate=Function("buffer",t)},Resampler.prototype.bypassResampler=function(t){return this.noReturn?(this.outputBuffer=t,t.length):t},Resampler.prototype.bufferSlice=function(t){if(this.noReturn)return t;try{return this.outputBuffer.subarray(0,t)}catch(e){try{return this.outputBuffer.length=t,this.outputBuffer}catch(e){return this.outputBuffer.slice(0,t)}}},Resampler.prototype.initializeBuffers=function(t){try{this.outputBuffer=new Float32Array(this.outputBufferSize),this.lastOutput=new Float32Array(this.channels)}catch(t){this.outputBuffer=[],this.lastOutput=[]}};var sampleRate,resampler,recLength=0,recBuffers=[];function init(t){sampleRate=t.sampleRate,resampler=new Resampler(sampleRate,16e3,1,51200)}function record(t){recBuffers.push(t[0]),recLength+=t[0].length}function exportWAV(t){var e=encodeWAV(mergeBuffers(recBuffers,recLength)),r=new Blob([e],{type:t});this.postMessage(r)}function exportRAW(t){var e=encodeRAW(mergeBuffers(recBuffers,recLength)),r=new Blob([e],{type:t});this.postMessage(r)}function export16kMono(t){var e=mergeBuffers(recBuffers,recLength),r=encodeRAW(resampler.resampler(e)),i=new Blob([r],{type:t});this.postMessage(i)}function exportSpeex(t){var e=mergeBuffers(recBuffers,recLength),r=Speex.process(e),i=new Blob([r],{type:t});this.postMessage(i)}function getBuffer(){var t=[];t.push(mergeBuffers(recBuffers,recLength)),this.postMessage(t)}function clear(){recLength=0,recBuffers=[]}function mergeBuffers(t,e){for(var r=new Float32Array(e),i=0,a=0;a<t.length;a++)r.set(t[a],i),i+=t[a].length;return r}function interleave(t,e){for(var r=t.length+e.length,i=new Float32Array(r),a=0,s=0;a<r;)i[a++]=t[s],i[a++]=e[s],s++;return i}function mix(t,e){for(var r=t.length,i=new Float32Array(r),a=0,s=0;a<r;)i[a++]=t[s]+e[s],s++;return i}function floatTo16BitPCM(t,e,r){for(var i=0;i<r.length;i++,e+=2){var a=Math.max(-1,Math.min(1,r[i]));t.setInt16(e,a<0?32768*a:32767*a,!0)}}function writeString(t,e,r){for(var i=0;i<r.length;i++)t.setUint8(e+i,r.charCodeAt(i))}function encodeWAV(t){var e=new ArrayBuffer(44+2*t.length),r=new DataView(e);return writeString(r,0,"RIFF"),r.setUint32(4,32+2*t.length,!0),writeString(r,8,"WAVE"),writeString(r,12,"fmt "),r.setUint32(16,16,!0),r.setUint16(20,1,!0),r.setUint16(22,2,!0),r.setUint32(24,sampleRate,!0),r.setUint32(28,4*sampleRate,!0),r.setUint16(32,4,!0),r.setUint16(34,16,!0),writeString(r,36,"data"),r.setUint32(40,2*t.length,!0),floatTo16BitPCM(r,44,t),r}function encodeRAW(t){var e=new ArrayBuffer(2*t.length),r=new DataView(e);return floatTo16BitPCM(r,0,t),r}this.onmessage=function(t){switch(t.data.command){case"init":init(t.data.config);break;case"record":record(t.data.buffer);break;case"exportWAV":exportWAV(t.data.type);break;case"exportRAW":exportRAW(t.data.type);break;case"export16kMono":export16kMono(t.data.type);break;case"getBuffer":getBuffer();break;case"clear":clear()}};
