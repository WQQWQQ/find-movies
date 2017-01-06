<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/27
 * Time: 14:42
 */

header("Content-Type: text/html; charset=utf-8");
require_once("functions.php");
if(isset($_POST["username"]) && isset($_POST['password']) && isset($_POST['email'])){
    require_once("mysql.php");
    if($conn){
        $name=test_input($_POST['username']);
        $clearpsw=test_input($_POST['password']);
        $password=MD5(test_input($_POST['password']));
        $email=test_input($_POST['email']);
        $date=date("Y-m-d");
        $map_style='light';
        $result1=mysqli_query($conn,"SELECT * FROM user WHERE username = '".$name."'");
        $result2=mysqli_query($conn,"SELECT * FROM user WHERE email = '".$email."'");
        if(mysqli_num_rows($result1)>0){
            $response=array("status"=>"No","info"=>"该用户名已被注册","type"=>4);
        }elseif(mysqli_num_rows($result2)>0){
            $response=array("status"=>"No","info"=>"该邮箱已被注册","type"=>3);
        }else{
            $sql="INSERT INTO user (username,password,clearpsw,email,reg_time,map_style) VALUES ('".$name."','".$password."','".$clearpsw."','".$email."','".$date."','".$map_style."')";
            mysqli_query($conn,$sql);
            if(mysqli_errno($conn)){
                $response=array("status"=>"No","info"=>"数据库查询失败","type"=>1);
            }else{
                $response=array("status"=>"Yes","info"=>"注册成功","type"=>2);
            }
        }
    }
    else{
        $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
    }
}else{
    $response=array("status"=>"No","info"=>"参数错误","type"=>1);
}
echo json_encode($response,JSON_UNESCAPED_UNICODE);exit;


