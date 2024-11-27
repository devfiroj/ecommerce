const n=20;
const array=[];

init();

function init(){
    for(let i=0;i<n;i++){
        array[i]=Math.random();
    }
    showbars();
}

function play1(){
    const copy=[...array];
    const swaps=bubblesort(copy);
    animate(swaps);
}
function play2(){
    const copy=[...array];
    const swaps=selectionsort(copy);
    animate(swaps);
}
function animate(swaps){
    if(swaps.length==0){
        showbars();
        return;
    }
    const [i,j]=swaps.shift();
    [array[i],array[j]]=[array[j],array[i]];
    showbars([i,j]);
    
    setTimeout(function(){
        animate(swaps);
    }, 1000);

}
function bubblesort(array){
    const swaps=[];
    var j=array.length
    do{
        var swapped=false;
        for(let i=1;i<j;i++){
            if(array[i-1]>array[i]){
                swapped=true;
                swaps.push([i-1,i]);
                [array[i-1],array[i]]=[array[i],array[i-1]];
            }
        }
        j--;
    }while(swapped && j>1);
    return swaps;

}
function selectionsort(array){
    const swaps=[];
    var n=array.length
   
    for(let j=0;j<n-1;j++){
        var mini=j;
        for(let i=j;i<n;i++){
            if(array[mini]>array[i]){
                mini=i;
            }
        }
        swaps.push([j,mini]);
        [array[j],array[mini]]=[array[mini],array[j]];
    }
    return swaps;

}


function showbars(indices){
    container.innerHTML="";
    for(let i=0;i<array.length;i++){
        const bar=document.createElement("div");
        bar.style.height=array[i]*100+"%";
        bar.classList.add("bar");

        if(indices && indices.includes(i)){
            bar.style.backgroundColor="red";
        }
        container.appendChild(bar);
    }
}
