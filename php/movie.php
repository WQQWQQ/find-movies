<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/31
 * Time: 8:49
 */


header("Content-Type: text/html; charset=utf-8");
require_once("functions.php");
if(isset($_POST['act']) && $_POST['act']){
    require_once("mysql.php");
    if($_POST['act'] == "add"){
        if(isset($_POST["movies"]) && $_POST['movies']){
            if($conn){
                $movies=$_POST['movies'];
                $movies_num=count($movies);
                mysqli_query($conn,"DELETE FROM hot_movie");
                for($i=0;$i<$movies_num;$i++){
                    $movie_id=$movies[$i]["movie_id"];
                    $movie_name=test_input($movies[$i]["movie_name"]);
                    $movie_type=test_input($movies[$i]["movie_type"]);
                    $movie_release_date=test_input($movies[$i]["movie_release_date"]);
                    $movie_nation=test_input($movies[$i]["movie_nation"]);
                    $movie_starring=strtr($movies[$i]["movie_starring"],"'"," ");
                    $movie_length=test_input($movies[$i]["movie_length"]);
                    $movie_picture=test_input($movies[$i]["movie_big_picture"]);
                    $movie_score=test_input($movies[$i]["movie_score"]);
                    $movie_director=test_input($movies[$i]["movie_director"]);
                    $movie_tags=test_input($movies[$i]["movie_tags"]);
                    $movie_message=test_input($movies[$i]["movie_message"]);

                    $sql="INSERT INTO hot_movie (movie_id,movie_name,movie_score,movie_pic,movie_length,
                              movie_type,movie_tags,movie_msg,movie_nation,
                              movie_date,movie_director,movie_star) VALUES ('$movie_id','$movie_name',
                              '$movie_score','$movie_picture','$movie_length','$movie_type','$movie_tags',
                              '$movie_message','$movie_nation','$movie_release_date','$movie_director','$movie_starring')";
                    mysqli_query($conn,$sql);
                    $result=mysqli_query($conn,"SELECT * FROM movies WHERE movie_id = '".$movie_id."'");
                    if(mysqli_num_rows($result)==0){

                        $sql1="INSERT INTO movies (movie_id,moviename,movie_score,movie_pic,movie_length,
                              movie_type,movie_tag,movie_msg,movie_country,
                              movie_date,movie_director,movie_star) VALUES ('$movie_id','$movie_name',
                              '$movie_score','$movie_picture','$movie_length','$movie_type','$movie_tags',
                              '$movie_message','$movie_nation','$movie_release_date','$movie_director','$movie_starring')";
                        mysqli_query($conn,$sql1);
                    }
                }
                if(mysqli_errno($conn)){
                    $response=array("status"=>"No","info"=>"数据库操作失败","type"=>1);
                }else{
                    $response=array("status"=>"Yes","info"=>"添加电影成功","type"=>2);
                }
            }else{
                $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
            }
        }else{
            $response=array("status"=>"No","info"=>"参数错误","type"=>1);
        }
    }elseif($_POST['act'] == "collect"){
        if(isset($_POST["m_id"]) && $_POST['m_id']){
            if($conn){
                $m_id=$_POST['m_id'];
                $user_id=$_COOKIE["fm_uid"];
                $check_query=mysqli_query($conn,"SELECT * FROM m_collect WHERE movie_id = '".$m_id."' AND user_id = '" .$user_id."' LIMIT 1");
                if(mysqli_num_rows($check_query)>0){
                    $response=array("status"=>"No","info"=>"您已收藏该电影","type"=>3);
                }else{
                    $date=date("Y-m-d");
                    $sql="INSERT INTO m_collect (user_id,movie_id,collect_date) VALUES ('$user_id','$m_id','$date')";
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
            $query=mysqli_query($conn,"SELECT movie_id FROM m_collect WHERE user_id = '".$user_id."'");
            $count=mysqli_num_rows($query);
            if($count>0){
                $love_movie=array();
                for($i=0;$i<$count;$i++){
                    $arr=mysqli_fetch_assoc($query);
                    $love_movie[$i]=$arr['movie_id'];
                }
                $response=array("status"=>"Yes","info"=>"查询成功","type"=>2,"data"=>$love_movie);
            }else{
                $response=array("status"=>"No","info"=>"无查询结果","type"=>1);
            }

        }else{
            $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
        }
    }elseif($_POST['act'] == "mycollect"){
        if($conn){
            $user_id=$_COOKIE["fm_uid"];
            $query=mysqli_query($conn,"SELECT movie_id FROM m_collect WHERE user_id = '".$user_id."'");
            $count=mysqli_num_rows($query);
            if($count>0){
                $love_movie=array();
                for($i=0;$i<$count;$i++){
                    $arr=mysqli_fetch_assoc($query);
                    $love_movie[$i]=$arr['movie_id'];
                }
                $collect_movie=array();
                for($a=0;$a<$count;$a++){
                    $query1=mysqli_query($conn,"SELECT * FROM movies WHERE movie_id = '".$love_movie[$a]."'");
                    $arr1=mysqli_fetch_assoc($query1);
                    $collect_movie[$a]=$arr1;
                }
                $response=array("status"=>"Yes","info"=>"查询成功","type"=>2,"data"=>$collect_movie);
            }else{
                $response=array("status"=>"No","info"=>"无查询结果","type"=>1);
            }
        }else{
            $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
        }
    }elseif($_POST['act'] == "delete"){
        if(isset($_POST["m_id"]) && $_POST['m_id']){
            if($conn){
                $m_id=$_POST['m_id'];
                $user_id=$_COOKIE["fm_uid"];
                $check_query=mysqli_query($conn,"DELETE FROM m_collect WHERE movie_id = '".$m_id."' AND user_id = '" .$user_id."'");
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