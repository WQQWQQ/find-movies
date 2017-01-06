/**
 * Created by Administrator on 2015/12/1.
 */
$(function(){
    $("#register").on("click",function(){
       if($("#nickname").val()==''){
           layer.msg('请填写用户名',{time:2000});
       }else if($("#email").val()==''){
           layer.msg('请填写邮箱地址',{time:2000});
       }else if(!/^[\w\.\-]+@([\w\-]+\.)+[a-zA-Z]+$/.test($("#email").val())){
           layer.msg('邮箱地址不合法',{time:2000});
       }else if($("#passwords").val()==''){
           layer.msg('请输入密码',{time:2000});
       }else if($("#confirm").val()==''){
           layer.msg('请再次确认密码',{time:2000});
       }else if($("#confirm").val()!=$("#passwords").val()){
           layer.msg('两次输入的密码不一致，请再次确认密码',{time:2000});
       }else{
           $.ajax({
               url:PATH+"php/reg.php",
               type:"POST",
               dataType:"json",
               data:{
                   username:$("#nickname").val(),
                   email:$("#email").val(),
                   password:$("#passwords").val()
               },
               success:function(data){
                   console.log(data);
                   if(data.status=="Yes"){
                       layer.msg("注册成功！",{time:2000},function(){
                           location.href=PATH+'main/main.html';
                       })
                   }else{
                       if(data.type==4){
                           $("#nickname").focus();
                           layer.msg(data.info,{time:2000});
                       }else if(data.type==3){
                           $("#email").focus();
                           layer.msg(data.info,{time:2000});
                       }

                   }
               }
           });
       }
    });



});