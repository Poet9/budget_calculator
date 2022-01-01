
                                   //budget Controller module
let budgetController = (function(){
              //creating object constrectors of income and expense
  let Expense = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }
  let Income = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
  }
  Expense.prototype.calculatePercentages = function(totalInc){
    if(totalInc > 0){this.percentage = Math.round((this.value/totalInc)*100);}
    else {this.percentage = -1;}
  };
  Expense.prototype.getPercentages = function(){return this.percentage;}

                            //calculate budget 
  let calculateTotals = function(type){
    let sum = 0;
    data.allItems[type].forEach(function(current){
      sum += current.value;
    });
    data.totals[type] = sum;
  }
                              //saving data 
  let data = {
    allItems : {
      exp :[],
      inc :[]
    },
    totals : {
      exp:0,
      inc:0
    }, 
    budget: 0,
    percentage:-1
  }
  return {
    addItems: function(type, desc,val){
      let newItem,ID;
                  //creating ID of the new item
      if (data.allItems[type].length>0){
          ID = data.allItems[type][data.allItems[type].length-1].id+1;}
      else {ID=0;}
                //creating the new item
      if (type === "inc"){newItem = new Income(ID,desc,val);}
      else if (type === "exp"){newItem = new Expense(ID,desc,val);}
      data.allItems[type].push(newItem); //pushing ne item into the data
      return newItem;
    },
    deleteItems : function(type,id){
      let ids,index;
      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1){data.allItems[type].splice(index,1);}
    },
                            //calculate budget 
    calculateBudget: function(){
           //calculate total income/expenses
      calculateTotals('inc');
      calculateTotals("exp");
           //calculate budget 
      data.budget = data.totals.inc - data.totals.exp;
           //calculate pourcentage
      if(data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
      }
      else{
        data.percentage = "---";
      }
    },

    getBudget : function(){
      return {
        budget : data.budget,
        percentage : data.percentage,
        totalInc : data.totals.inc,
        totalExp : data.totals.exp
      };
    },
                       // calculate percentages 
    calculatePercs: function(){
      data.allItems.exp.forEach(function(current){
        current.calculatePercentages(data.totals.inc);
      });    
    },
    getPercs : function(){
      let allPercentages = data.allItems.exp.map(function(current){
        return current.getPercentages();
      });
      return allPercentages;
    },
                                        //delete it aftrward
    testing : function (){
      return data;  
    }
  };
})();

                        //UI controller module
let UIController = (function(){
                        //object with class/ID names
  let DOMStrings = {
    allPercentage: ".budgetExp_percentage",
    sign :"#inOrOut" ,
    motive:"#nameIt" ,
    device:"#device" ,
    value: "#value",
    inputBtn: "#dispense",
    incomeContainer :"#incomeDispense",
    expenseContainer :"#outcomeDispense",
    budgetLabel : "#budget",
    incomeLabel : "#incomeResult",
    expensesLabel : "#outcomeResult",
    container : ".container",
    expensePercLabel : ".pourcentage_expense",
    dateLabel : ".currentDate"
  };
  let valueFormat = function(num, type){
    let numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
     if(int.length > 3){int =int.substr(0,int.length-3)+ ","+ int.substr(length-3, 3);}
    dec = numSplit[1];
    return  (type === 'exp'? '- ': '+ ') + int + '.'+ dec;
  }
  let nodeListForEach = function(list, callback){
    for (i = 0;i<list.length;i++){
      callback(list[i],i);
    }
  };
    return {
      getInput : function(){
        return {
        sign : document.querySelector(DOMStrings.sign).value,
        motive : document.querySelector(DOMStrings.motive).value,
        device : document.querySelector(DOMStrings.device).value,
        value : parseFloat(document.querySelector(DOMStrings.value).value)
        };
      },
          //create new DOM items inc/exp
      addListItems : function(obj, type){
      
        let html,newHtml,element;
        if (type === "inc"){
            element = DOMStrings.incomeContainer;
            html = '<div class="item clearfix" id = "inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="delete_item"><button class="delete_item_btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        else if (type === "exp"){
          element = DOMStrings.expenseContainer;
          html = '<div class="item clearfix" id = "exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="pourcentage_expense">25%</div><div class="delete_item"><button class="delete_item_btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        newHtml = html.replace('%id%',obj.id);
        newHtml = newHtml.replace('%description%',obj.description);
        newHtml = newHtml.replace('%value%',valueFormat(obj.value,type));
        document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
      },
          //clear input fields and go back to description
      clearFields : function(){
        let fields, fieldsArr;
        fields = document.querySelectorAll(DOMStrings.motive + ", "+ DOMStrings.value);
        fieldsArr = Array.prototype.slice.call(fields);
        fieldsArr.forEach(function(current,index,array) {
          current.value = "";          
        });
        fieldsArr[0].focus();
      },
          //display budget 
      displayBudget : function(obj){
        let type;
        obj.budget >= 0 ? type = "inc": type = "exp";
        document.querySelector(DOMStrings.budgetLabel).textContent = valueFormat(obj.budget,type);
        document.querySelector(DOMStrings.incomeLabel).textContent = valueFormat(obj.totalInc,"inc");
        document.querySelector(DOMStrings.expensesLabel).textContent = valueFormat(obj.totalExp, "exp");
        if(obj.totalInc > 0){
          document.querySelector(DOMStrings.allPercentage).textContent = obj.percentage + '%';
        }
        else {
          document.querySelector(DOMStrings.allPercentage).textContent = '---';
        }
      },
          //display Percentages
      displayPercentages : function(percentages){
        let fields = document.querySelectorAll(DOMStrings.expensePercLabel);
        nodeListForEach(fields, function(current, index){
          if(percentages[index] > 0){current.textContent = percentages[index] + "%";}
          else {current.textContent = "---";}
        });
      },

          // display current date
      displayDate : function(){
        let year,month,now;
        now = new Date();
        year = now.getFullYear();
        months = ["January", "February", "March", "April", "May","June", "July","August","September","October","November","December"];
        month = now.getMonth();
        document.querySelector(DOMStrings.dateLabel).textContent = months[month]+" "+year+":";
      },
      changedType : function(){
        let fields;
        fields = document.querySelectorAll(
          DOMStrings.sign+','+
          DOMStrings.motive+','+
          DOMStrings.value+','+
          DOMStrings.device);

        nodeListForEach(fields, function(current){
          current.classList.toggle("focus_red");
        });
        document.querySelector("#dispense").classList.toggle("red");
      },
          // return classes/ids names
      getDOMStrings : function(){
          return DOMStrings;
        }
      
    };

})();

                        //controller module
let controller = (function(budgetCtrl, UICtrl){
                                  //All event listener in here
  let setupEventListener = function(){
    let DOMY = UICtrl.getDOMStrings();
    document.querySelector(DOMY.inputBtn).addEventListener('click',crtlAddItem);
    document.addEventListener("keypress", function(event){
    if(event.key==="Enter"){crtlAddItem();}
  });
  document.querySelector(DOMY.container).addEventListener("click",ctrlDeleteItem);
  document.querySelector(DOMY.sign).addEventListener('change', UICtrl.changedType);
  }
  let updateBudget = function (){
    let budget;
               //1. calculate budget 
    budgetCtrl.calculateBudget();
               //2.Return budget
    budget = budgetCtrl.getBudget();
               //3. display budget on UI
    UICtrl.displayBudget(budget);
  }
  let updatePercentages = function(){
            //1. calculate the percentages 
    budgetCtrl.calculatePercs();
            //2. read percentages from budget controller 
    let allPercs = budgetCtrl.getPercs();
            //3. update the percentages in the UI 
    UICtrl.displayPercentages(allPercs);
  }
                              //add items function
  let crtlAddItem = function(){
    let inputs,newItem;
                 //1. get the user input field
    inputs= UICtrl.getInput();
    if (inputs.description != "" && !isNaN(inputs.value) && inputs.value > 0){
                 //2. add item to budget controller
      newItem =budgetCtrl.addItems(inputs.sign,inputs.motive,inputs.value);
                 //3. add item to UI
      UICtrl.addListItems(newItem, inputs.sign);
                 //4. clear input fields
      UICtrl.clearFields();
    }
                 //5. update the budget
    updateBudget();
                 //6. update percentages 
    updatePercentages();
  }
  let ctrlDeleteItem = function(event){
    let itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(itemID);
    if(itemID){
      splitID = itemID.split("-");
      type = splitID[0];
      ID = splitID[1];
           //1. delete item from data structure
      budgetCtrl.deleteItems(type, Number(ID));
           //2. delete item from the IU 
      document.querySelector("#" +itemID).remove();
           //3. update and show budget
      updateBudget();
           //4. update percentages 
      updatePercentages();       
    }
  }

  return {
    init : function(){
      UICtrl.displayBudget({
        budget : 0,
        percentage : -1,
        totalInc : 0,
        totalExp : 0
      });
      setupEventListener();
      UICtrl.displayDate();
    }
  }
  

})(budgetController,UIController);

controller.init();