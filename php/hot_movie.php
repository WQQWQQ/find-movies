<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/4/6
 * Time: 14:36
 */
header("Content-Type: text/html; charset=utf-8");
require_once("functions.php");
if(isset($_POST['filter_type']) && isset($_POST['filter_tag']) && isset($_POST['sort_type']) && isset($_POST['order_type']) ){
    require_once("mysql.php");
    if($conn){
        $filter_type=$_POST['filter_type'];
        $filter_tag=$_POST['filter_tag'];
        $sort_type=$_POST['sort_type'];
        $order_type=$_POST['order_type'];
        $condition=" ";
        $order=" ";
        $orderby=" ";
        if($filter_type == "" && $filter_tag !=''){
            $condition=" where movie_tags like '%" . $filter_tag."%'";
        }elseif($filter_type !='' && $filter_tag ==''){
            $condition=" where movie_type like '%" . $filter_type."%'";
        }elseif($filter_type !='' && $filter_tag !=''){
            $condition=" where movie_type like '%" . $filter_type . "%' and movie_tags like '%" . $filter_tag ."%'";
        }
        if($sort_type=='score'){
            $orderby=" ORDER BY " . "movie_score";
        }elseif($sort_type=='date'){
            $orderby=" ORDER BY " . "movie_date";
        }
        if($order_type=='desc'){
            $order=" desc";
        }elseif($order_type=='asc'){
            $order=" asc";
        }
        $sql="SELECT * FROM hot_movie" . $condition . $orderby . $order;
        $result=mysqli_query($conn,$sql);
        $count=mysqli_num_rows($result);
        $res=array();
        for($i=0;$i<$count;$i++){
            $res[$i]=mysqli_fetch_assoc($result);
        }
        if(mysqli_errno($conn)){
            $response=array("status"=>"No","info"=>"数据库操作失败","type"=>1);
        }else{
            $response=array("status"=>"Yes","info"=>"查询成功","type"=>2,"data"=>$res);
        }

    }else{
        $response=array("status"=>"No","info"=>"数据库连接失败","type"=>1);
    }
}else{
    $response=array("status"=>"No","info"=>"参数错误","type"=>1);
}

echo json_encode($response,JSON_UNESCAPED_UNICODE);exit;