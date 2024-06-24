App = {
    loading: false,
    contracts: {},
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
        await App.renderTasks()
    },

    loadWeb3: async () => {
        window.addEventListener('load', async () => {
       // Modern dapp browsers...
       if (window.ethereum) {
           window.web3 = new Web3(ethereum);
           console.log("Loaded....")
           try {
               // Request account access if needed
               await ethereum.enable();
               // Acccounts now exposed
               web3.eth.sendTransaction({/* ... */});
           } catch (error) {
               // User denied account access...
           }
       }
       // Legacy dapp browsers...
       else if (window.web3) {
           window.web3 = new Web3(web3.currentProvider);
           // Acccounts always exposed
           web3.eth.sendTransaction({/* ... */});
       }
       // Non-dapp browsers...
       else {
           console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
       }
       });
   },


    loadAccount: async () => {
        App.account = await ethereum.request({ method: 'eth_accounts' }); 
        console.log(App.account)
    },

    loadContract: async()=>{
        const todoList = await $.getJSON('TodoList.json')

        App.contracts.TodoList = TruffleContract(todoList)
        App.contracts.TodoList.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));


        App.todoList = await App.contracts.TodoList.deployed()

    },


    render: async () => {
        if(App.loading){
            return
        }

        App.setLoading(true)

        $(`#account`).html(App.account)

        App.setLoading(false)
    },

    setLoading: (boolean) => {
        App.loading = boolean;
        const loader = $('#loader');
        const content = $('#content');
        if (boolean) {
            loader.show();
            content.hide();
        } else {
            loader.hide();
            content.show();
        }
    },

    renderTasks: async()=>{
         // load all the tasks from the blockchain
         const taskCount = await App.todoList.taskCount();
         const $tackTemplate = $(".taskTemplate");
 
         // render each of the tasks
         for (var i = 1; i <= taskCount; i++){
             const task = await App.todoList.tasks(i);
             const task_id = task[0].toNumber();
             const task_content = task[1];
             const task_completed = task[2];
 
             // Create the html for the task
             const $newTaskTemplate = $tackTemplate.clone()
             $newTaskTemplate.find('.content').html(task_content)
             $newTaskTemplate.find('input')
                             .prop('name', task_id)
                             .prop('checked', task_completed)
                             .on('click', App.toggleCompleted)
     
             // Put the task in the correct list
             if (task_completed) {
                 $('#completedTaskList').append($newTaskTemplate)
             } else {
                 $('#taskList').append($newTaskTemplate)
             }
     
             // Show the task
             $newTaskTemplate.show()
         }
    },


}

$(() => {
    $(window).load(() => {
        App.load()
    })
})