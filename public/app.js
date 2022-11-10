let socket = io();

const labels = [
    'Workload',
    'Grading',
    'Exams',
    'Content',
    'Professor',
  ];

const chartdata = {
labels: labels,
datasets: [{
label: ["Ignore"],
data: [0, 0, 0, 0, 0],
backgroundColor: 
[
'rgba(255, 99, 132, 0.2)',
'rgba(255, 159, 64, 0.2)',
'rgba(255, 205, 86, 0.2)',
'rgba(75, 192, 192, 0.2)',
'rgba(54, 162, 235, 0.2)',
],
borderColor: [
'rgb(255, 99, 132)',
'rgb(255, 159, 64)',
'rgb(255, 205, 86)',
'rgb(75, 192, 192)',
'rgb(54, 162, 235)',
],
borderWidth: 1
}]
};




const start = () =>
{
   setTimeout(function()
   {
       confetti.start()
   },
   1000);
};

const stop = () =>
{
   setTimeout(function()
   {
       confetti.stop()
   },
   3000);
};


function spawnconfetti()
{
    start();
    stop();
}


const config = {
    type: 'bar',
    data: chartdata,
    options: {
      plugins:{
          legend:{
              display:false
          },
          title :{
              display:true,
              text: 'Student Votes',
              borderColor: '#ffff'
          }

      },
     
      scales: {
        y: {
          beginAtZero: true
        }
      }
    },
  };

 

socket.on('connect', function() {
    console.log("Connected");
  });


let myChart;

window.addEventListener('load', ()=> {

    let globalText = "";

    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
    window.history.go(1);
    };


    let chart = document.getElementById("myChart").getContext("2d");
    myChart = new Chart(
        chart,
        config
    );
    let courseName = "";

    socket.on( 'sdata' , (data)=> {
        if(data.comment == globalText){
            addMyMessage(data.comment);
        }

        else{
            addMessage(data.comment);
        }
    });
    //myChart.defaults.global.legend.display = false

    fetch('/courses')
    .then(res => res.json())
    .then(data => {

  
        let container = document.querySelector(".courseWindow");

        data.courseArray.forEach(e =>{

            let child = document.createElement('button');
            child.classList.add("course");
            child.innerHTML = e;
            
            child.addEventListener('click', ()=>{

                courseName = child.innerHTML;
                showComments(courseName);
                showPoll(courseName);

            });

            container.appendChild(child);

        });

    });

    let form = document.getElementById("form");
    form.addEventListener('submit', handleForm);

    let formComment = document.getElementById("formComment");
    formComment.addEventListener('submit', handleForm);

    function handleForm(event) { event.preventDefault(); } 


    let btn = document.querySelector(".btn");

        btn.addEventListener("click",()=>{

            let textVal = document.getElementById("textVal")
            courseName = textVal.value;
            showComments(courseName);
            showPoll(courseName);
        });
    

    let button = document.querySelector('.btnComment');
    button.addEventListener('click',()=>{

            updateScroll();

            let text = document.getElementById("textValComment");

            if(text.value != "")
            { 
                globalText = text.value;

                let commentObj = {
                "courseName" : courseName,
                "comment" : text.value,
                "updateAt" : new Date()
                };
              
                socket.emit('data',commentObj);
            }

    });


    let pollsubmit = document.querySelector('.pollsubmitbtn');
    pollsubmit.addEventListener('click',()=> {

        let wpoll = document.getElementById("workload").value;
        let gpoll = document.getElementById("grading").value;
        let epoll = document.getElementById("exams").value;
        let cpoll = document.getElementById("content").value;
        let ppoll = document.getElementById("professor").value;

        let pollObj = {
            "courseName" : courseName,
            "polldata" : [wpoll,gpoll,epoll,cpoll,ppoll],
            "updateAt" : new Date()
            };

        let pollobjJSON = JSON.stringify(pollObj);
        socket.emit('poll',pollObj);
        console.log(pollobjJSON);
        showPoll(courseName);
        spawnconfetti();
        openpopup();
        closeslidercontainer();
    })

    let popupclosebtn= document.querySelector('.popupclosebtn');
    let pollsliderscontainer = document.querySelector('.sliderscontainer');
    let pollopenbutton  = document.querySelector('.callpollpopup');

    let crossbutton = document.querySelector('.closeButton');

    popupclosebtn.addEventListener('click',()=> {
        closepopup();
    })
    pollopenbutton.addEventListener('click',()=> {
        openslidercontainer();
    })
    crossbutton.addEventListener('click',()=> {
        closeslidercontainer();
    })
  
});
 
function addMessage( message){

    let elem = document.createElement('div');
        elem.innerHTML = message;
        elem.classList.add('comment');

        let container = document.querySelector('.commentContainer');
        container.appendChild(elem);
}

function addMyMessage( message){

    let elem = document.createElement('div');
        elem.innerHTML = message;
        elem.classList.add('comment1');

        let container = document.querySelector('.commentContainer');
        container.appendChild(elem);
}

function removeMessages(){

    let container = document.querySelector('.commentContainer');
    let child = container.lastElementChild;

    while(child)
    {
        container.removeChild(child);
        child = container.lastElementChild;
    }

}

function showComments(courseName){

            removeMessages();

            let courseWindow = document.querySelector('.courseContainer');
            courseWindow.style.display = "none";

            let eachContainer = document.querySelector('.eachContainer');
            eachContainer.style.display = "flex";


            let courseHeading = document.querySelector('.courseHeading');
            courseHeading.innerHTML = courseName;
    
            let url = "/comments?selectedCourse="+courseName;

            fetch(url)
            .then(res => res.json())
            .then(data =>{

                let arr = data.comments;
                arr.forEach(e => {
                    addMessage(e.comment);    
                });

            })
}

function showPoll(courseName)
{

    let url2 = "/polls?selectedCourse="+courseName;
    fetch(url2)
    .then(res => res.json())
    .then(data =>{

        
        let pollsarray = data.poll; // Gets all the poll for the courses
        let t_wpoll = 0;     // Total Workload
        let t_gpoll = 0;     // Total Grading
        let t_epoll = 0;     // Total Exams
        let t_cpoll = 0;     // Total Content
        let t_ppoll = 0;     // Total professor     
        let totaluserpoll = 0;
        
        console.log(pollsarray);

        let a_wpoll = 0;     // Average Workload
        let a_gpoll = 0;     // Average Grading
        let a_epoll = 0;     // Average Exams
        let a_cpoll = 0;     // Average Content
        let a_ppoll = 0;     // Average Professor

      

        pollsarray.forEach(e => {
           t_wpoll += parseInt(e.polldata[0]);
           t_gpoll += parseInt(e.polldata[1]);
           t_epoll += parseInt(e.polldata[2]);
           t_cpoll += parseInt(e.polldata[3]);
           t_ppoll += parseInt(e.polldata[4]);
           totaluserpoll++;
        });

        a_wpoll = t_wpoll/totaluserpoll;
        a_gpoll = t_gpoll/totaluserpoll;
        a_epoll = t_epoll/totaluserpoll;
        a_cpoll = t_cpoll/totaluserpoll;
        a_ppoll = t_ppoll/totaluserpoll;

        console.log("Average Workload :" +a_wpoll);
        console.log("Average Grading :" +a_gpoll);
        console.log("Average Exams:" +a_epoll);
        console.log("Average Content :" +a_cpoll);
        console.log("Average Professor :" +a_ppoll);


        average_data = [a_wpoll,a_gpoll,a_epoll,a_cpoll,a_ppoll];
        chartdata.datasets[0].data = average_data;
        document.querySelector('.votecounter').innerHTML = totaluserpoll+" students voted";

        myChart.update();

        console.log(chartdata.datasets[0].data);

    
    })
}


function openpopup()
{
    let popupwindow = document.querySelector('.Thankyoupopup');
    popupwindow.classList.add("open-popup");

}

function closepopup()
{
    let popupwindow = document.querySelector('.Thankyoupopup');
    popupwindow.classList.remove("open-popup");
}


function openslidercontainer()
{
    let sliderspopup = document.querySelector('.sliderscontainer');
    sliderspopup.classList.add("sliderscontainer-open");

}

function closeslidercontainer()
{
    let sliderspopup = document.querySelector('.sliderscontainer');
    sliderspopup.classList.remove("sliderscontainer-open");
}

function updateScroll(){
    var element = document.getElementById("containerID");
    element.scrollTop = element.scrollHeight;
}

