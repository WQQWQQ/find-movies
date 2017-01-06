<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/31
 * Time: 8:50
 */



header("Content-Type: text/html; charset=utf-8");
require_once("functions.php");
if(isset($_POST['act']) && $_POST['act']){
    require_once("mysql.php");
    if($_POST['act'] == "add"){
        if(isset($_POST["cinemas"]) && $_POST['cinemas']){
            if($conn){
                $cinemas=$_POST['cinemas'];
                $cinemas_num=count($cinemas);
                $info=array();
                for($i=0;$i<$cinemas_num;$i++){
                    $cinema_id=$cinemas[$i]["uid"];
                    $result=mysqli_query($conn,"SELECT * FROM cinema WHERE uid = '".$cinema_id."'");
                    if(mysqli_num_rows($result)==0){
                        $address=test_input($cinemas[$i]["address"]);
                        $telephone=test_input($cinemas[$i]["telephone"]);
                        $rating=test_input($cinemas[$i]["rating"]);
                        $name=test_input($cinemas[$i]["name"]);
                        $uid=test_input($cinemas[$i]["uid"]);
                        $sql="INSERT INTO cinema (uid,cinemaname,address,score,phone) VALUES ('$uid','$name','$address','$rating','$telephone')";
                        mysqli_query($conn,$sql);
                        if(mysqli_errno($conn)){
                            $info[$i]='No';
                        }else{
                            $info[$i]='Yes';
                        }
                    }
                }
                $response=array("status"=>"Yes","info"=>$info,"type"=>2);

            }else{
                $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
            }
        }else{
            $response=array("status"=>"No","info"=>"参数错误","type"=>1);
        }
    }elseif($_POST['act'] == "collect"){
        if(isset($_POST["c_id"]) && $_POST['c_id']){
            if($conn){
                $c_id=$_POST['c_id'];
                $user_id=$_COOKIE["fm_uid"];
                $check_query=mysqli_query($conn,"SELECT * FROM c_collect WHERE cinema_id = '".$c_id."' AND user_id = '" .$user_id."' LIMIT 1");
                if(mysqli_num_rows($check_query)>0){
                    $response=array("status"=>"No","info"=>"您已收藏该影院","type"=>3);
                }else{
                    $date=date("Y-m-d");
                    $sql="INSERT INTO c_collect (user_id,cinema_id,collect_date) VALUES ('$user_id','$c_id','$date')";
                    mysqli_query($conn,$sql);
                    if(mysqli_errno($conn)){
                        $response=array("status"=>"No","info"=>"数据库查询失败","type"=>1);
                    }else{
                        $response=array("status"=>"Yes","info"=>"收藏成功","type"=>2);
                    }
                }
            }else{
                $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
            }
        }else{
            $response=array("status"=>"No","info"=>"参数错误","type"=>1);
        }
    }elseif($_POST['act'] == "mylove"){
        if($conn){
            $user_id=$_COOKIE["fm_uid"];
            $query=mysqli_query($conn,"SELECT cinema_id FROM c_collect WHERE user_id = '".$user_id."'");
            $count=mysqli_num_rows($query);
            if($count>0){
                $love_cinema=array();
                for($i=0;$i<$count;$i++){
                    $arr=mysqli_fetch_assoc($query);
                    $love_cinema[$i]=$arr['cinema_id'];
                }
                $response=array("status"=>"Yes","info"=>"查询成功","type"=>2,"data"=>$love_cinema);
            }else{
                $response=array("status"=>"No","info"=>"无查询结果","type"=>1);
            }
        }else{
            $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
        }
    }elseif($_POST['act'] == "mycollect"){
        if($conn){
            $user_id=$_COOKIE["fm_uid"];
            $query=mysqli_query($conn,"SELECT cinema_id FROM c_collect WHERE user_id = '".$user_id."'");
            $count=mysqli_num_rows($query);
            if($count>0){
                $love_cinema=array();
                for($i=0;$i<$count;$i++){
                    $arr=mysqli_fetch_assoc($query);
                    $love_cinema[$i]=$arr['cinema_id'];
                }
                $collect_cinema=array();
                for($a=0;$a<$count;$a++){
                    $query1=mysqli_query($conn,"SELECT * FROM cinema WHERE uid = '".$love_cinema[$a]."'");
                    $arr1=mysqli_fetch_assoc($query1);
                    $collect_cinema[$a]=$arr1;
                }
                $response=array("status"=>"Yes","info"=>"查询成功","type"=>2,"data"=>$collect_cinema);
            }else{
                $response=array("status"=>"No","info"=>"无查询结果","type"=>1);
            }
        }else{
            $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
        }
    }elseif($_POST['act'] == "delete"){
        if(isset($_POST["c_id"]) && $_POST['c_id']){
            if($conn){
                $c_id=$_POST['c_id'];
                $user_id=$_COOKIE["fm_uid"];
                $check_query=mysqli_query($conn,"DELETE FROM c_collect WHERE cinema_id = '".$c_id."' AND user_id = '" .$user_id."'");
                if(mysqli_errno($conn)){
                    $response=array("status"=>"No","info"=>"数据库删除失败","type"=>1);
                }else{
                    $response=array("status"=>"Yes","info"=>"删除成功","type"=>2);
                }
            }else{
                $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
            }
        }else{
            $response=array("status"=>"No","info"=>"参数错误","type"=>1);
        }
    }
}else{
    $response=array("status"=>"No","info"=>"参数错误","type"=>1);
}

echo json_encode($response,JSON_UNESCAPED_UNICODE);exit;