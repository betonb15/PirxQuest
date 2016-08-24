<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>
	<meta http-equiv="Expires" content="0"/>
	<meta name="description" content="Pirx Quest"/>
	<meta name="keywords" content="Pirx Quest"/>
	<meta name="author" content="Rafał Sputowski"/>

	<title>Pirx Quest</title>
	<link rel="stylesheet" type="text/css" href="style/main_graphicsJS.css">	

</head>

<body style="overflow:hidden;">

	<!--<audio controls autoplay loop style="display: none;" src="sounds/ambience1.mp3" preload="auto"></audio>!-->

	<table id="TableCanva" style="width: 100%; height: 800px; margin: 0px auto 0px auto; border: 0px solid black;">
		<tr>
			<td id="TdCanva" style="cursor: none;">			
				<canvas oncontextmenu="return false" id="Canva" style="border: 1px solid black">
					<script>
						var W = document.getElementById("TdCanva").clientWidth-200;
						var H = document.getElementById("TdCanva").clientHeight-0;
						document.getElementById("Canva").setAttribute("width",W);
						document.getElementById("Canva").setAttribute("height",H);
						document.getElementById("TableCanva").setAttribute("height",H);
					</script>
						Your browser does not support the canvas element.
				</canvas>						
			</td>
			<td style="width: 250px; vertical-align: top; padding: 0px 3px;">
				<div id="Status1" style="font-size: 10pt;"></div><br>
				<div id="Status2" style="font-size: 10pt;"></div><br>
				<input id="AI_Armed" type="checkbox" name="vehicle" value="AI_A">AI Armed<br/>
				<input id="AI_Control" type="checkbox" name="vehicle" value="AI_C" >AI Control<br/>
				<input id="AI_Live" type="checkbox" name="vehicle" value="AI_L">AI Live<br/>
				<input id="AI_TotalWar" type="checkbox" name="vehicle" value="AI_T">AI_TotalWar<br/>
				<input id="AI_Number" type="text" size="2" maxlength="2" name="vehicle" value="1">AI Ships<br/>
				<input id="AI_Guidance" type="text" size="5" maxlength="5" name="vehicle" value="1">AI Guidance<br/>
				<input id="AI_Speed" type="text" size="5" maxlength="5" name="vehicle" value="300">AI_Speed<br/>
				
				<select id="AI_Weapon" name="weapon">
					<option value="0">CPR7 Missile Launcher</option>
					<option value="1">CPR9 Missile Launcher</option>
					<option value="2">P7 Missile Launcher</option>
					<option value="3">Gatlling Gun HOT-SHOT</option>
					<option value="4">Gauss_MG47</option>
					<option value="5">Laser L3000</option>
					<option value="6">PlasmaGun PY200</option>
					<option value="7">Nuke Launcher</option>
					<option value="-1">Vary</option>
				</select>
				
				<input id="AI_Reset" type="button" name="vehicle" value="PLAY"><br/><br/>	

				<input id="Turn_on_player_input" type="checkbox" name="vehicle" value="PLAYER_OFF" checked>PLAYER ON<br/>
				<input id="Turn_on_serwer_call" type="checkbox" name="vehicle" value="PLAYER_OFF">CONNECTION ON<br/>
			</td>
		</tr>
		<tr style="height: 80px;">
			<td>		
				<div id="TextOut" style="font-family: verdana; padding: 0px 3px; vertical-align: top; font-size: 8pt; height: 80px; overflow-y: scroll; overflow-x: hidden; border: 1px solid black;"></div>				
			</td>
			<td>
			</td>
		</tr>
	</table>
	
	<script src="media.js"></script>
	<script src="pq1.js"></script>
	

</body>