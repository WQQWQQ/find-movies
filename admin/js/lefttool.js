var leftPathStatus 	= 0;
var leftangle 		= Math.PI/((4-1)*2);
var leftmainButton 	= [
	{'bg':'../img/bg-2x.png','css':'','cover':'../img/icon-2x.png','html':'<span class="cover"></span>'},
	{'bg':'','css':'','cover':'','html':'','angle':-405,'speed':200}
];
var leftRadius 		= 100;		//小图出来的半径
var leftOffset 		= 40;		//小图出来后的偏移量
var leftPath 		= 1;		//出现方式，1：左上，2:左下，3：右上，4：右下
var leftOutSpeed 	= 80;		//小图出现的速度
var leftOutIncr 	= 50;		//小图出来的旋转
var leftOffsetSpeed = 200;		//小图出来的旋转速度
var leftInSpeed 	= 480;		//小图进去的速度
var leftInIncr 		= -80;		//小图进去的旋转
function leftPathRun(){
	var PathMenu = $('#leftPathMenu');
	var PathItems = PathMenu.children('.PathItem').slice(0,4);
	if(leftPathStatus == 0){
		var Count = PathItems.size();
		PathItems.each(function(SP){
			var ID = $(this).index();
			if (ID == 1) {
				var X 	= leftRadius;
				var Y 	= 0; 
				var X1 	= X + leftOffset;
				var Y1 	= Y;
			}else if (ID == Count){
				var X 	= 0;
				var Y 	= leftRadius;
				var X1 	= X;
				var Y1 	= Y + leftOffset;
			}else{
				var X 	= Math.cos(leftangle * (ID - 1)) * leftRadius;
				var Y 	= Math.sin(leftangle * (ID - 1)) * leftRadius;
				var X1	= X + leftOffset;
				var Y1 	= Y + leftOffset;
			}
			
			if(leftPath==2){
				Y	= -Y;
				Y1	= -Y1;
			}else if(leftPath==3){
				X	= -X;
				Y	= -Y;
				X1	= -X1;
				Y1	= -Y1;
			}else if(leftPath==4){
				X	= -X;
				X1	= -X1;
			}

			$(this).children().children().animate({rotate:720},600);
			
			$(this).animate({left:X1,bottom:Y1},leftOutSpeed+SP*leftOutIncr,function(){
				$(this).animate({left:X,bottom:Y},leftOffsetSpeed);
			});	
		});
		
		if(leftmainButton[1]['leftangle']){
			$(PathMenu.children('.PathMain').find('.rotate')).animate({rotate:leftmainButton[1]['leftangle']},leftmainButton[1]['speed']);
		} 
		if(leftmainButton[1]['bg']!='') $(this).children().css('background-image','url('+leftmainButton[1]['bg']+')')
		if(leftmainButton[1]['css']!='') $(this).children().css(leftmainButton[1]['css']);
		if(leftmainButton[1]['cover']!='') $(this).children().children().css('background-image','url('+leftmainButton[1]['cover']+')');
		if(leftmainButton[1]['html']!='') $(this).children().html(leftmainButton[1]['html']);
		
		leftPathStatus = 1;
	}else if(leftPathStatus == 1){
		PathItems.each(function(SP){
			if(parseInt($(this).css('left'))==0){
				X1 = 0;
			}else{
				if(leftPath <=2){
					X1 = parseInt($(this).css('left')) + leftOffset;
				}else if(leftPath >=3){
					X1 = parseInt($(this).css('left')) - leftOffset;
				}
			}
			
			if(parseInt($(this).css('bottom'))==0){
				Y1 = 0;
			}else{
				if(leftPath==3 || leftPath==2){
					Y1 = parseInt($(this).css('bottom')) - leftOffset;
				}else if(leftPath ==1 || leftPath == 4){
					Y1 = parseInt($(this).css('bottom')) + leftOffset;
				}
			}
			$(this).children().children().animate({rotate:0},600);
			$(this).animate({left:X1,bottom:Y1},leftOffsetSpeed,function(){
				$(this).animate({left:0,bottom:0},leftInSpeed+SP*leftInIncr);
				
			});
		});
		
		if(leftmainButton[1]['leftangle']){
			$(PathMenu.children('.PathMain').find('.rotate')).animate({rotate:0},leftmainButton[1]['speed']);
		} 		
		
		if(leftmainButton[0]['bg']!='') $(this).children().css('background-image','url('+leftmainButton[0]['bg']+')')
		if(leftmainButton[0]['css']!='') $(this).children().css(leftmainButton[0]['css']);
		if(leftmainButton[0]['cover']!='') $(this).children().children().css('background-image','url('+leftmainButton[0]['cover']+')');
		if(leftmainButton[0]['html']!='') $(this).children().html(leftmainButton[0]['html']);
				
		leftPathStatus = 0;
	}
}
