module.exports = {
    timesOverlap: function(oStart, oEnd, oDays, nStart, nEnd, nDays){
    var aHourStart = parseInt(oStart.slice(0,2)) * 60;
    var aMinStart = parseInt(oStart.slice(3,));
    var aStartTot = aHourStart + aMinStart;
    var bHourStart = parseInt(nStart.slice(0,2)) * 60;
    var bMinStart = parseInt(nStart.slice(3,));
    var bStartTot = bHourStart + bMinStart;
    var aHourEnd= parseInt(oEnd.slice(0,2)) * 60;
    var aMinEnd = parseInt(oEnd.slice(3,));
    var aEndTot = aHourEnd + aMinEnd;
    var bHourEnd = parseInt(nEnd.slice(0,2)) * 60;
    var bMinEnd = parseInt(nEnd.slice(3,));
    var bEndTot = bHourEnd + bMinEnd;
    for(const day in oDays){
        if(nDays.includes(day)){
            if((aStartTot <= bStartTot && bStartTot < aEndTot) || (aStartTot < bEndTot && bEndTot <= aEndTot)){
                return true;
             }
             else{
               return false;
             }
        }
    }
  }
}