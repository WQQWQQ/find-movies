<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/28
 * Time: 21:36
 */

session_start();
if(!isset($_SESSION['userid'])){
    $response=array("status"=>"No","info"=>"未登录","type"=>3);
    setcookie("map_style","light",null,'/');
}else{
    require_once("mysql.php");
    if($conn){
        $userid = $_SESSION['userid'];
        $username = $_SESSION['username'];
        if(isset($_POST['map_style']) && $_POST['map_style']){
            $map_style=$_POST['map_style'];
            $map_query=mysqli_query($conn,"update user set map_style = '$map_style' where id='$userid' and username='$username'");
        }
        $user_query = mysqli_query($conn,"select id,username,email,reg_time,map_style from user where id= '$userid' limit 1");
        $row = mysqli_fetch_assoc($user_query);
        setcookie("map_style",$row['map_style'],null,'/');
        $response=array("status"=>"Yes","info"=>"已登录","type"=>2,"data"=>$row);
    }else{
        $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
    }
}
echo json_encode($response,JSON_UNESCAPED_UNICODE);exit;