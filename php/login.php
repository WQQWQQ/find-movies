<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/28
 * Time: 20:24
 */


header("Content-Type: text/html; charset=utf-8");
require_once("functions.php");
session_start();
if(isset($_POST['act']) && $_POST['act']){
    if($_POST['act'] == "logout"){
        unset($_SESSION['userid']);
        unset($_SESSION['username']);
        setcookie("map_style","light",null,'/');
        setcookie("fm_name","",time()-3600,'/');
        setcookie("fm_uid","",time()-3600,'/');
        $response=array("status"=>"Yes","info"=>"注销成功","type"=>2);
    }elseif($_POST['act'] == "login"){
        if(isset($_POST["username"]) && isset($_POST['password'])){
            require_once("mysql.php");
            if($conn){
                $name=test_input($_POST['username']);
                $password=MD5(test_input($_POST['password']));
                $check_query =mysqli_query($conn,"SELECT password,id,map_style FROM user WHERE username = '".$name."' limit 1");
                $result = mysqli_fetch_assoc($check_query);
                if($result){
                    if($result['password']==$password){
                        $_SESSION['username'] = $name;
                        $_SESSION['userid'] = $result['id'];

                        if(isset($_POST['rem'])){
                            $rem=$_POST['rem'];
                            if($rem=='true'){
                                setcookie("fm_name",$name,time()+604800,'/');
                                setcookie("fm_uid",$result['id'],time()+604800,'/');
                            }else{
                                setcookie("fm_name",$name,null,'/');
                                setcookie("fm_uid",$result['id'],null,'/');
                            }
                        }else{
                            setcookie("fm_name",$name,null,'/');
                            setcookie("fm_uid",$result['id'],null,'/');
                        }
                        setcookie("map_style",$result['map_style'],null,'/');
                        $response=array("status"=>"Yes","info"=>"登录成功","type"=>2);
                    }else{
                        $response=array("status"=>"No","info"=>"密码错误","type"=>4);
                    }
                }else{
                    $response=array("status"=>"No","info"=>"该用户尚未注册","type"=>3);
                }
            }else{
                $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
            }
        }else{
            $response=array("status"=>"No","info"=>"参数错误","type"=>1);
        }
    }elseif($_POST['act'] == "free"){
        if(isset($_POST["name"]) && isset($_POST['uid'])){
            require_once("mysql.php");
            if($conn){
                $name=$_POST["name"];
                $uid=$_POST["uid"];
                $check_query =mysqli_query($conn,"SELECT * FROM user WHERE username = '".$name."' and id='".$uid."' limit 1");
                $result = mysqli_fetch_assoc($check_query);
                if($result){
                    $_SESSION['username'] = $name;
                    $_SESSION['userid'] = $uid;
                    setcookie("map_style",$result['map_style'],null,'/');
                    $response=array("status"=>"Yes","info"=>"登录成功","type"=>2);
                }
            }
        }
    }
}else{
    $response=array("status"=>"No","info"=>"参数错误","type"=>1);
}

echo json_encode($response,JSON_UNESCAPED_UNICODE);exit;