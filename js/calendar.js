/*!
 * Calendar object for managing a Gregorian calendar
 * valid from years 1583 to 9999
 * In compliance to ISO 8601
 *
 * Copyright © 2018 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 *
 */
 
var calendar = function (options){
  /*
   * Internally, the month is handled between 0 and 11.
   * All interface calls require month to be between 1 and 12.
   */
    Number.prototype.pad = function(size) {
      return ('000000000' + this).substr(-size);
    }
    if (!options) options = {
      weekdayInitials: ["S","M","T","W","T","F","S"],
      monthNames: ["January","February","March","April","May","June",
      "July", "August", "September", "October", "November", "December"],
      festivities: {},
    }
  /*
   * Format for festivities is as follow:
   *   Description: [festivity/ferial]|[ES/mmdd][displacement][modificator]
   *     where:
   *       festivity = 1: closed for business
   *       ferial = 0: other celebratory days
   *       mmdd = base date: 1225 = december 25
   *       ES = Easter Sunday
   *       modifier: +1 MO = base plus next monday
   *                 +2 SU = base plus two sundays
   *                -46    = base minus 46 days 
   */
  
    var self = {
      index: [],
    };
  
    self.festivities = (year) => {
      var list = {};
      for (let f in options.festivities) {
        const pattern = options.festivities[f].split("|");
        var modif = pattern[1].split(" ");
        var modifp = 2;
        if (pattern[0]==1) {
          var base = new Date();
          base.setUTCFullYear(year);
          base.setUTCHours(0,0,0,0);
          if (modif[0]=="ES") {
            const es = self.easterSunday(year).split("-");
            base.setUTCMonth(es[1] - 1, es[2]);
            if (modif.length>1){
              base.setUTCDate(base.getUTCDate() + parseInt(modif[1]));
              modifp++;
            }
          } else {
            base.setUTCMonth((modif[0].substring(0, 2) - 1), modif[0].substring(2, 4));
          }
          if (modifp<modif.length) {
            switch (modif[modifp]) {
            case "MO": // Monday modifier
              base.setUTCDate(base.getUTCDate() + ((7 - base.getUTCDay())%7 + 1) % 7);
              break;
            case "SU": // Sunday modifier
              base.setUTCDate(base.getUTCDate() + 14 - base.getUTCDay());
              break;
            default: // Any day modifier
            }
          }
          if (!list[base.getUTCMonth()]) list[base.getUTCMonth()] = {}
          list[base.getUTCMonth()][base.getUTCDate()] = f;
        }
      }
      return(list);
    }
  
    self.range = (start, end) => {
      if(!end) {
        let now = new Date();
        if(!start) {
          start = now.toISOString().split("T")[0];
        }
        now.setUTCMonth(now.getUTCMonth()+1);
        end = now.toISOString().split("T")[0];
      } else {
        if(!start) {
          let moment = new Date(end);
          moment.setUTCMonth(moment.getUTCMonth()-1);
          start = moment.toISOString().split("T")[0];
        }
      } 
      const start_date = start.split("-").map(Number);
      const end_date = end.split("-").map(Number);
      let dow = self.dayOfWeek(...start_date);
      let wk = self.ISOWeek(...start_date);
      // Months are zero-based
      start_date[1]--;
      end_date[1]--;
      let range = {}
      for (let yr = start_date[0]; yr<=end_date[0]; yr++){
        range[yr] = {};
        const fest = self.festivities(yr);
        const sm = (yr==start_date[0])?start_date[1]:0;
        for (let mo = sm; mo<12; mo++){
          if ((yr==end_date[0])&&(mo>end_date[1])) break;
          range[yr][mo] = {};
          const eom = self.monthDays(yr, (mo+1));
          const sd = (mo==start_date[1])?start_date[2]:1;
          for (let dm = sd; dm<=eom; dm++){
            if ((yr==end_date[0])&&(mo==end_date[1])&&(dm>end_date[2])) break;
            if(!range[yr][mo][wk]) range[yr][mo][wk] = {};
            if(fest[mo]&&fest[mo][dm]) range[yr][mo][wk][dm] = fest[mo][dm];
            else range[yr][mo][wk][dm] = "";
            dow++;
            if(dow>6) {
              wk++;
              dow=0;
            }
          }
        }
      }
      return range;
    }
    
    self.dayOfWeek = (year, month, day) => {
      let a = Math.floor((14 - month) / 12);
      let y = year - a;
      let m = month + 12 * a - 2;
      let d = (day + y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(year / 400) + Math.floor((31 * m) / 12)) % 7;
      return d;
    }
  
    self.ISOWeek = (year, month, day) => {
      // January 4 is always in week 1.
      let d = self.dayOfWeek(year, 1, 4);
      for(let m = (month-1); m>0; m--) d += self.monthDays(year, m);
      d += (month==1)?(day - 4):(day - 4);
      let w = Math.floor(d / 7) + 1;
      if (w==0) {
        w = self.ISOWeek(year-1, 12, 31);
      }
      return w;
    }
  
    self.monthDays = (year, month) => {
      if (month==2) {
        return (28+(!(year%400)|(!(year%4)&(year%100)!=0)));
      } else if ((month==4)|(month==6)|(month==9)|(month==11)) {
        return 30;
      } else {
        return 31;
      }
    }
  
    self.easterSunday = (year) => {
    /* Computus algorithm for Easter Sunday
    *  Butcher's algorithm, Ecclesiastical almanac, 1876
    */
      if ((year>=1583)&&(year<9999)) {
        let a = year%19;
        let b = parseInt(year/100);
        let c = year%100;
        let d = parseInt(b/4);
        let e = b%4;
        let f = parseInt((b+8)/25);
        let g = parseInt((b-f+1)/3);
        let h = (19*a+b-d-g+15)%30;
        let i = parseInt(c/4);
        let k = c%4;
        let l = (32+2*e+2*i-h-k)%7;
        let m = parseInt((a+11*h+22*l)/451);
        let n = h+l-7*m+114;
        return (`${year}-${parseInt((n/31))}-${parseInt(1+(n%31))}`);
      } else {
        return (`Year ${year} is out of range`);
      }
    }
  
    self.timeline = function(range) {
      let viewport = document.createElement("div");
      let tbl_yr = document.createElement("table");
      tbl_yr.className = "timeline";
      let tr_yr = document.createElement("tr");
      tbl_yr.appendChild(tr_yr);
      viewport.appendChild(tbl_yr);
      let d = 0;
      const fyr = Object.keys(range)[0];
      const fmo = Object.keys(range[fyr])[0];
      const fdm = Object.keys(range[fyr][fmo][Object.keys(range[fyr][fmo])[0]])[0];
      let wn = Object.keys(range[fyr][fmo])[0];
      let dw = self.dayOfWeek(Number(fyr), Number(fmo) + 1, Number(fdm));
      for (let yr in range) {
        for (let mo in range[yr]) {
          let td_mo = document.createElement("td");
          if (Object.keys(range[yr][mo]).length>1)
            td_mo.appendChild(document.createTextNode(options.monthNames[(mo)]+" "+yr));
          else
            td_mo.appendChild(document.createTextNode(options.monthNames[(mo)].slice(0,1)));
          td_mo.className = "timeline month";
          tr_yr.appendChild(td_mo);
          let tbl_mo = document.createElement("table");
          let tr_mo = document.createElement("tr");
          tbl_mo.appendChild(tr_mo);
          td_mo.appendChild(tbl_mo);
          for (let wk in range[yr][mo]) {
            let td_wk = document.createElement("td");
            let tbl_wk = document.createElement("table");
            let tr_wk = document.createElement("tr");
            td_wk.appendChild(document.createTextNode(wn));
            td_wk.appendChild(tbl_wk);
            tbl_wk.appendChild(tr_wk);
            td_wk.className = "timeline week";
            tr_mo.appendChild(td_wk);
            for (let dm in range[yr][mo][wk]){
              let dw_div = document.createElement("td");
              dw_div.appendChild(document.createTextNode(options.weekdayInitials[dw]));
              dw_div.appendChild(document.createElement("br"));
              dw_div.className = "timeline day";
              tr_wk.appendChild(dw_div);
              if (dw==0) dw_div.classList.add("sunday");
              if (dw==6) dw_div.classList.add("saturday");
              if (self.from===0) self.from = new Date(yr,mo-1,dm);
              self.index.push(yr+"-"+parseInt(mo).pad(2)+"-"+parseInt(dm).pad(2));
              dw_div.dayIndex = d;
              dw_div.weekDay = dw;
              dw_div.id = "day_"+d;
              if(range[yr][mo][wk][dm]!=""){
                dw_div.isHoliday = true;
                dw_div.classList.add("holiday");
                dw_div.title = range[yr][mo][wk][dm];
                dw_div.appendChild(document.createTextNode(dm));
              } else {
                dw_div.isHoliday = false;
                dw_div.appendChild(document.createTextNode(dm));
              }
              d++;
              dw++;
              if(dw>6) {
                dw=0;
                wn++;
                if(wn>51) wn = self.ISOWeek(Number(yr),Number(mo)+1,Number(dm)+1);
              }
            }
          }
        }
      }
      return viewport;
    }
 
    self.timelineRow = function(range) {
      let viewport = document.createElement("tr");
      viewport.className = "timeline row";
      let d = 0;
      const fyr = Object.keys(range)[0];
      const fmo = Object.keys(range[fyr])[0];
      const fdm = Object.keys(range[fyr][fmo][Object.keys(range[fyr][fmo])[0]])[0];
      let wn = Object.keys(range[fyr][fmo])[0];
      let dw = self.dayOfWeek(Number(fyr), Number(fmo) + 1, Number(fdm));
      for (let yr in range) {
        for (let mo in range[yr]) {
          for (let wk in range[yr][mo]) {
            let td_wk = document.createElement("td");
            let tbl_wk = document.createElement("table");
            let tr_wk = document.createElement("tr");
            td_wk.appendChild(tbl_wk);
            tbl_wk.appendChild(tr_wk);
            td_wk.className = "timeline week";
            viewport.appendChild(td_wk);
            for (let dm in range[yr][mo][wk]){
              let dw_div = document.createElement("td");
              dw_div.className = "timeline day";
              tr_wk.appendChild(dw_div);
              if (dw==0) dw_div.classList.add("sunday");
              if (dw==6) dw_div.classList.add("saturday");
              if (self.from===0) self.from = new Date(yr,mo-1,dm);
              self.index.push(yr+"-"+parseInt(mo).pad(2)+"-"+parseInt(dm).pad(2));
              dw_div.dayIndex = d;
              dw_div.weekDay = dw;
              //dw_div.id = "day_"+d;
              if(range[yr][mo][wk][dm]!=""){
                dw_div.isHoliday = true;
                dw_div.classList.add("holiday");
                dw_div.title = range[yr][mo][wk][dm];
              } else {
                dw_div.isHoliday = false;
              }
              d++;
              dw++;
              if(dw>6) {
                dw=0;
                wn++;
                if(wn>51) wn = self.ISOWeek(Number(yr),Number(mo)+1,Number(dm)+1);
              }
            }
          }
        }
      }
      return viewport;
    }

    return self;
  };
  