var correctCallNumsOrder = [
  "885.6 D399AsE2 v. 1", 
  "885.6 D399AsE2 v. 2", 
  "885.6 D399AsE5 2003 ", 
  "885.6 D399As4 v.2", 
  "885.6 D399As4 v.3", 
  "885.6 D399As6", 
  "885.6 D399Z G357 2002  ", 
  "885.6 D399Z W899 2000  ", 
  "885.6 J175d  ",
  "885.9 M66 v.1 ", 
  "885.9 M66 v.2 ", 
  "886.2 AL17As  ", 
  "887.0109 Oh3w 2003  ", 
  "887.0109 R279a 1993  "
];

var callNums = [
  "885.6 D399Z G357 2002  ", 
  "885.6 D399Z W899 2000  ", 
  "885.6 D399As4 v.3", 
  "885.6 D399As4 v.2", 
  "885.6 D399As6",   
  "885.6 D399AsE2 v. 1", 
  "885.6 D399AsE2 v. 2", 
  "885.6 D399AsE5 2003 ",  
  "885.6 J175d  ", 
  "885.9 M66 v.1 ", 
  "885.9 M66 v.2 ", 
  "886.2 AL17As  ", 
  "887.0109 Oh3w 2003  ", 
  "887.0109 R279a 1993  "
];

//runTest();

function runTest(){
  console.log("Running test...");
  
  callNums.sort(compareCallNums);
  
  console.log(callNums);
  console.log(correctCallNumsOrder);
  console.log("Order correct?: " + checkSort());
}

function checkSort(){
  var isCorrect = true;
  for(i=0; i < correctCallNumsOrder.length; i++){
    if(correctCallNumsOrder[i] != callNums[i])
      isCorrect = false;
  }
  return isCorrect;
}

function compareCallNums(num1, num2){
  var num1Segs = num1.trim().split(" ");
  var num2Segs = num2.trim().split(" ");
  //0 = same, 1 = first larger, -1 = second larger
  var comparison = 0;
  
  if(num1Segs[0] != num2Segs[0]){
    //Compare subject numbers
    var bookNum1 = parseInt(num1Segs[0]);
    var bookNum2 = parseInt(num2Segs[0]);
    comparison = bookNum1 > bookNum2 ? 1 : -1;
  } 
  else if(num1Segs[1] != num2Segs[1]){
    //Compare Cutter1 numbers
    comparison = compareCutters(num1Segs[1], num2Segs[1]);
  }
  else{
    //Identify and compare remaining segments
    //could be second cutter, a year, a copy number, a volume number, or all of the above, or none of the above
    var longest = num1Segs.length > num2Segs.length ? num1Segs.length : num2Segs.length;
    for(i=2; i < longest; i++){
      if(comparison == 0){
        comparison = compareIndeterminate(num1Segs[i], num2Segs[i]);
      }
    }
  }
  
  return comparison;
}

function compareIndeterminate(ind1Raw, ind2Raw){
  // 0 = same, 1 first larger, -1 second larger
  var comp = 0;
  var ind1 = identifyIndeterminate(ind1Raw);
  var ind2 = identifyIndeterminate(ind2Raw);
  
  if(ind1.id != ind2.id)
    comp = ind1.id > ind2.id ? 1 : -1;
  else if(ind1.id == 1){
    //if they're the same, then just check first to see if they're cutters
    comp = compareCutters(ind1Raw, ind2Raw);
  }
  else {
    //otherwise years, volumes, and copies can just be compared numerically by value
    comp = ind1.value > ind2.value ? 1 : -1;
  }
  
  return comp;
}

function identifyIndeterminate(ind){
  //could be a cutter, a year, a volume number, a copy number, which have primacy in that order
  // cutter = 1, year 2, vol 3, copy 4
  var response = {
    id: 0,
    value: 0
  };
  var cutterPattern = /^[A-Z][a-zL]*\d+.*/;
  var yearPattern = /^(\d\d\d\d)/;
  var volPattern = /[^c]\. *(\d+)/;
  var copyPattern = /c\. *(\d+)/;
  
  var cutterMatch = ind.match(cutterPattern);
  if(cutterMatch != null){
    response.id = 1;
    response.value = ind;
  }
  else {
    var yearMatch = ind.match(yearPattern);
    if(yearMatch != null){
      response.id = 2;
      response.value = parseInt(yearMatch[1]);
    }
    else {
      var volMatch = ind.match(volPattern);
      if(volMatch != null){
        response.id = 3;
        response.value = parseInt(volMatch[1]);
      }
      else {
        var copyMatch = ind.match(copyPattern);
        if(copyMatch != null){
          response.id = 4;
          response.value = parseInt(copyMatch[1]);
        }
      }
    }
  }
  
  return response;
}

function compareCutters(cut1Raw, cut2Raw){
  // 0 = same, 1 first larger, -1 second larger
  var comp = 0;

  var cut1 = parseCutter(cut1Raw);
  var cut2 = parseCutter(cut2Raw);
  
  if(cut1.letter != cut2.letter){
    comp = cut1.letter > cut2.letter ? 1 : -1; 
  }
  else if(cut1.number != cut2.number){
    comp = cut1.number > cut2.number ? 1 : -1;
  }
  else if(cut1.workMark != cut2.workMark){ 
    comp = compareWorkMarks(cut1.workMark, cut2.workMark);
  }  
  
  return comp;
}

function compareWorkMarks(wrk1Raw, wrk2Raw){
  //AsE2
  //AsE5
  //As4
  //A1
  // 0 = same, 1 first larger, -1 second larger
  var cmp = 0;
  
  var wrk1 = parseWorkMark(wrk1Raw);
  var wrk2 = parseWorkMark(wrk2Raw);
  
  if(wrk1.letter != wrk2.letter){
    cmp = wrk1.letter > wrk2.letter ? 1 : -1;
  }
  else {
    //As < AsE < AsE2 < As2
    if(wrk1.transLetter != wrk2.transLetter){
      //Either only one has a trans letter or they have different transletters
      if(wrk1.transLetter != "" && wrk2.transLetter != ""){
        //if they both have trans letters, just go by alphabet
        cmp = wrk1.transLetter > wrk2.transLetter ? 1 : -1;
      } else {
       //otherwise, only one of them has a trans letter, so order depends on transletter/number combo
        //(No trans/no number) < (trans / no number) < (trans / number) < (no trans / number)
        // so say 1 < 2 < 3 < 4 for comparing above combos
        cmp = getComboNumber(wrk1) > getComboNumber(wrk2) ? 1 : -1;
      }
    } 
    else if (wrk1.number != wrk2.number){
      //if the same trans letter, can just go by number
      //No number (empty string) automatically goes before a number
      cmp = wrk1.number > wrk2.number ? 1 : -1;
    }
  }
  
  return cmp;
}

function getComboNumber(wrk){
  //For ranking workmarks
  //(No trans/no number) < (trans / no number) < (trans / number) < (no trans / number)
  // so say 1 < 2 < 3 < 4 for comparing above combos
  
  var comboNum = 0;
  
  if(wrk.transLetter == ""){
    comboNum = wrk.number == "" ? 1 : 4; 
  } else {
    comboNum = wrk.number == "" ? 2 : 3;
  }
  
  return comboNum;
}

function parseWorkMark(wrk){
  var wrkSegs = wrk.match(/^([A-Z][a-zL]*)([A-KM-Z]*)(\d*)/);
  
  var parsedNumber = "";
  
  if(wrkSegs[3] != "")
    parsedNumber = parseInt(wrkSegs[3]);
  
  return {
    full: wrk,
    letter: wrkSegs[1],
    transLetter: wrkSegs[2],
    number: parsedNumber
  }
}

function parseCutter(ctr){
  var ctrSegs = ctr.match(/^([A-Z][a-zL]*)(\d*)(.*)/);
  
  return {
    full: ctr,
    letter: ctrSegs[1],
    number: parseInt(ctrSegs[2]),
    workMark: ctrSegs[3]
  };
  
}