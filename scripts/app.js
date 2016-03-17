
//Init
(function(){
    if(localStorage.getItem("boards") === null){
        localStorage.setItem("boards",JSON.stringify([]));
    }
})();



// Our main app component, TaskBoard. It envelopes and initiates other two elements: TaskList and TaskCard
// There is only one taskboard at a time. Depending on taskboard, tasklists and tasks inside them are displayed.
var TaskBoard = React.createClass({
    getInitialState: function() {
        return {data: [],isBoardSelected: false, isAddListActive: false};
    },
    
    componentDidMount: function(){
        console.info("TaskBoard loaded!");
    },
    
    updateTaskList: function(data){
        this.setState({data: data, isBoardSelected: true, isAddListActive: false});
    },
    toggleNewTaskList: function(){
      var status = !this.state.isAddListActive;  
        this.setState({isAddListActive: status});
    
    },
    render: function(){
        
        var taskLists = this.state.data.map((taskList)=>{
            return (
                <TaskList UpdateBoard={this.updateTaskList} key={taskList.id} taskLists={this.state.data} title={taskList.title} id={taskList.id} tasks={taskList.taskItems}></TaskList>
            )
        })
        
        if(this.state.data.length)
            return (
                <div className="taskBoard">
                    <div className="taskBoardInnerContent">
                        {taskLists}
                        <div className="taskList newList">
                            <a href="#" onClick={this.toggleNewTaskList} className="newTaskList">+ Add a list</a>
                            {this.state.isAddListActive?<AddTaskListForm onAddNewTaskList={this.updateTaskList}></AddTaskListForm>:''}
                        </div>
                    </div>
                </div>
            )
        else if( this.state.isBoardSelected == false)
            return(
                <div className="initMessage">
                    <p>Please select or create a taskboard on top right corner.</p>
                </div>
            )
        else 
            return(
               <div className="taskBoard">
                    <div className="taskBoardInnerContent">
                        <div className="taskList newList">
                            <a href="#" onClick={this.toggleNewTaskList}className="newTaskList">+ Add a list</a>
                            {this.state.isAddListActive?<AddTaskListForm onAddNewTaskList={this.updateTaskList}></AddTaskListForm>:''}
                        </div>
                    </div>
                </div>
            )
    }
});

// Create a handle, that will hold the instance of taskboard
var TaskBoardHandle =  ReactDOM.render(
     <TaskBoard />,
     document.getElementById('app-main')
);







// TaskList is the child of TaskBoard. It can be anywhere from 0-whatever limit user wants to create. It contains TaskCards.
var TaskList = React.createClass({
    getInitialState: function(){
      return({tasks: [], title: "", id: "",taskLists: []});  
    },
    componentDidMount: function(){
      this.setState({tasks: this.props.tasks, title: this.props.title, id: this.props.id, taskLists: this.props.taskLists});  
    },
    updateTasks: function(tasks){
        this.setState({tasks: tasks});
    },
    updateTaskList: function(newTaskItems){
        this.updateTasks(newTaskItems);
        
        var boardData = JSON.parse(localStorage.getItem(SelectTaskBoardHandle.getCurrentBoard()));
        boardData.forEach((taskList,index)=>{
            console.log(taskList);
            if(taskList.id === this.state.id){
                taskList.taskItems = this.state.tasks;
                return;
            }
        });
        localStorage.setItem(SelectTaskBoardHandle.getCurrentBoard(),JSON.stringify(boardData));
      
    },
    removeTaskList: function(){
        var newTaskList = this.state.taskLists;
        newTaskList.forEach((taskList,index)=>{
           if(taskList.id === this.state.id){
               newTaskList.splice(index,1);
           } 
        });
        localStorage.setItem(SelectTaskBoardHandle.getCurrentBoard(), JSON.stringify(newTaskList));
        this.props.UpdateBoard(newTaskList);
        
    },
    render: function(){
        var taskList = this.state.tasks.map((taskItem)=>{
            var listID = this.state.id;
            var taskList = this.state.tasks;
            return (
                <TaskCard UpdateTasks={this.updateTaskList} key={taskItem.id} tasks={taskList} listID={listID} task={taskItem}></TaskCard>
            )
        })
        return(
            <div className="taskList">
                <div className="taskListInnerContent">
                    <div className="tasklistHead"><h4 className="taskListTitle">{this.state.title}</h4><i className="material-icons icon-button" onClick={this.removeTaskList}>delete</i></div>
                    {taskList}
                    <AddNewTaskCard onAddTask={this.updateTasks} taskListID={this.state.id}></AddNewTaskCard>
                </div>
            </div>
        )
    }
});










// This is the last basic component and the simplest one in hierarchy. It is a card that contains task description. 
var TaskCard = React.createClass({
    getInitialState: function(){
      return ({editMode: false ,newContent: ''});  
    },
    deleteTask: function(){
        var tasks = this.props.tasks;
        tasks.forEach((task,index)=>{
            if(task.id === this.props.task.id ){
                tasks.splice(index,1);
                return;
            }                             
        });
        this.props.UpdateTasks(tasks);
            
    },
    renameTask: function(){
        this.setState({editMode:true,newContent: this.props.task.content});
    },
    onInputChange: function(e){
        this.setState({newContent: e.target.value});
    },
    updateTaskContent: function(){
      if(this.state.newContent ==''){ this.setState({editMode:false}); return; }
       var tasks = this.props.tasks;
        tasks.forEach((task,index)=>{
            if(task.id === this.props.task.id ){
                task.content = this.state.newContent;
                return;
            }                             
        });
        this.props.UpdateTasks(tasks);
        this.setState({editMode:false});
        
    },
    render: function(){
        return (
            <div className="taskCard">
                {this.state.editMode ?  <div className="taskCardInnerContent"><input autofocus type="text" onChange={this.onInputChange} value={this.state.newContent} placeholder="New content" className="addTaskInput rename"/><i className="material-icons icon-button" onClick={this.updateTaskContent}><b>done</b></i></div>:<div className="taskCardInnerContent">
           <span className="card-content">{this.props.task.content}</span>
                    <i className="material-icons icon-button" onClick={this.renameTask}>edit</i>
                    <i className="material-icons icon-button" onClick={this.deleteTask}>delete</i></div>
            }
            </div>
        )
    }
});








var AddNewTaskCard = React.createClass({
    getInitialState: function(){
      
        return({taskContent: '',showSubmit:false});
        
    },
    onInputChange: function(e){
        if(e.target.value === ''){ this.setState({taskContent: e.target.value,showSubmit: false}) }else
        this.setState({taskContent: e.target.value,showSubmit:true}); 
        
    },
    addNewTask: function(e){
        
        e.stopPropagation();
        e.preventDefault();
        
        if(e.target.value === '') return;
        var taskListID = this.props.taskListID;
        var task={};
        task.name = new Date();
        task.id= task.name;
        task.content = this.state.taskContent;
        
        var currentTasks = JSON.parse(localStorage.getItem( SelectTaskBoardHandle.getCurrentBoard() ));
        currentTasks.forEach((obj,i)=>{
            if(obj.id === taskListID){
                obj.taskItems.push(task);
                this.props.onAddTask(obj.taskItems);
                return;
            }
        });
        localStorage.setItem(SelectTaskBoardHandle.getCurrentBoard(),JSON.stringify(currentTasks));
        this.setState({taskContent: '',showSubmit:false});
    },
    render: function(){
        return(
            <div className="taskCard newTaskCard">
                    <form className="addTaskForm" onSubmit={this.addNewTask}>
                    <input type="text" onChange={this.onInputChange} value={this.state.taskContent} placeholder="+Add Task" className="addTaskInput"/>
            { this.state.showSubmit && <button type="submit" className="addTaskSubmit"><b className="material-icons icon-button">add</b></button>}
                    </form>
            </div>
        )
    }
});












var AddTaskListForm = React.createClass({
    getInitialState: function(){
      return({tasklistTitle: ''});  
    },
    tasklistTitleChange: function(e){
        this.setState({tasklistTitle: e.target.value});
    },
    addTaskList: function(e){
        e.stopPropagation();
        e.preventDefault();
        if(this.state.tasklistTitle === '') return;
        var newTaskList = {};
        newTaskList.id = new Date();
        newTaskList.title = this.state.tasklistTitle;
        newTaskList.taskItems = [];
        
        var activeBoard = SelectTaskBoardHandle.getCurrentBoard();
        var boardData = JSON.parse( localStorage.getItem(activeBoard) );
        if(boardData){
            boardData.push(newTaskList);
        }
        localStorage.setItem(activeBoard,JSON.stringify(boardData));
        this.props.onAddNewTaskList(boardData);
        this.setState({tasklistTitle: ''});
        SelectTaskBoardHandle.setCurrentBoard(activeBoard);
        
    },
    render: function(){
        return(
            <div className='AddCardForm'>
                    <input type="text" value={this.state.tasklistTitle} onChange={this.tasklistTitleChange} className="addBoardInput" placeholder="Tasklist title"/>
                    <input type="button" onClick={this.addTaskList} className="addBoardSubmit"  value="Add" />
            </div>
        )
    }
    
});














var AddNewBoardForm = React.createClass({
    getInitialState: function(){
      return({boardName: ''});  
    },
    boardNameChangedFn: function(e){
        this.setState({boardName: e.target.value});
    },
    addNewBoard: function(e){
        e.stopPropagation();
        e.preventDefault();
        if(this.state.boardName === '') return;
        localStorage.setItem(this.state.boardName,JSON.stringify([]));
        var currentBoards = JSON.parse(localStorage.getItem("boards"));
        currentBoards.push(this.state.boardName);
        localStorage.setItem("boards",JSON.stringify(currentBoards));
        SelectTaskBoardHandle.updateBoardList(currentBoards);
        SelectTaskBoardHandle.setCurrentBoard(this.state.boardName);
        this.setState({boardName:''});
    },
    render: function(){
        return(
            <div className='AddCardForm'>
                <form onSubmit={this.addNewBoard}>
                    <input type="text" value={this.state.tasklistTitle} onChange={this.boardNameChangedFn} className="addBoardInput" placeholder="Taskboard name"/>
                    <input type="submit" className="addBoardSubmit"  value="Add" />
                </form>
            </div>
        )
    }
    
});






// This component lists all the saved TaskBoards, based on selection of which, the TaskBoard renders TaskLists in a board.
var SelectTaskBoard = React.createClass({
    getInitialState: function(){
        return({taskBoards:[], currentBoard: "",addNewBoardActive: false});
    },
    componentDidMount: function(){
        var taskBoards = JSON.parse( localStorage.getItem("boards") );
        if(taskBoards !== null){
            this.setState({taskBoards: taskBoards});
        }else{
            console.error("No taskboards created!");
        }
    },
    updateBoardList: function(boardList){
        this.setState({taskBoards: boardList,addNewBoardActive: false});
    },
    setCurrentBoard: function(ev){
        var selectedBoard = (ev.target === undefined)?ev:ev.target.value;
        var currentBoard = JSON.parse( localStorage.getItem(selectedBoard) );
        if(currentBoard !== null) {
            TaskBoardHandle.updateTaskList(currentBoard);
            this.setState({currentBoard: selectedBoard, addNewBoardActive: false});
            SearchHandle.setSearchContext(selectedBoard);
        }else console.error("Invalid Task board!");
        
    },
    getCurrentBoard: function(){
      return(this.state.currentBoard);  
    },
    toggleAddBoard: function(){
        var status = !this.state.addNewBoardActive; 
        this.setState({addNewBoardActive: status});  
    },
    render: function(){
        var taskBoards = this.state.taskBoards.map(function(taskboard){
            return( <option value={taskboard}>{taskboard}</option> );
        });
        return(
            <div>
                <select onChange={this.setCurrentBoard} className="boardSelect">
                    <option disabled selected value="">Select Board</option>
                    {taskBoards}
                </select>
                <button onClick={this.toggleAddBoard} className="newBoardBtn">New Board</button>
                {this.state.addNewBoardActive?<AddNewBoardForm></AddNewBoardForm>:''}
            </div>
        )     
    }
});

// Handle for Taskboard Selector dropdown
var SelectTaskBoardHandle = ReactDOM.render(
    <SelectTaskBoard />,
    document.getElementById('boardOptions')
);
        
        
        

    
        
// This is auto search for searching Task Lists in a board.
var Search = React.createClass({
    getInitialState: function(){
      return ({results:[],board: "", resultsActive: false, statusMessage: "Please select board first!", populatedResults:""});  
    },
    SearchTextChange: function(e){
        this.setState({resultsActive:false});
        
       
        var createFilterFor = function(query) {
            query=query.toLowerCase();
          return function filterFn(taskList) {
            return (taskList.title.toLowerCase().indexOf(query) === 0);
          };
        };
        
       var boardData = JSON.parse(localStorage.getItem(this.state.board));
       var results = e.target.value ? boardData.filter( createFilterFor(e.target.value) ): boardData;
       //push the results into view as they match. 
       TaskBoardHandle.updateTaskList(results);
        
        
    },
    setSearchContext: function(context){
        this.setState({board: context, statusMessage:''});
    },
    render: function(){
        return (
            <div className="searchInnerContainer">
             {SelectTaskBoardHandle.getCurrentBoard()!==''?
                <input type="text" placeholder={"Search Task listings in "+SelectTaskBoardHandle.getCurrentBoard()} onChange={this.SearchTextChange} className="taskSearch" />:''}
            </div>
        )
    }
});

var SearchHandle = ReactDOM.render(
    <Search />,
    document.getElementById('searchContainer')
);