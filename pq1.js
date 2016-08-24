var Version = 'v0.0.3.8';

var GlobalScale = 0.55;
var GlobalVolume = 0.05;

var Mouse = {x:0,y:0};
var LastClickMouse = {x:0,y:0};
var Translation = {x:670,y:380,z:0};
var Rotation = {x:0,y:0,z:0};
var Scale = 50.0;
var MBPressed = {Left:false,Middle:false,Right:false};		//stan klawiszy myszy
var Command_Line_Count = 1;									//Numer wiersza w CMD
var Particles = [];											//Tablica elementów do rysowania
var Smokes = [];											//Cząstki dymu do rysowania
var Click_Count = 0;										//Numer klikniecia w narzędziach np. linia, powierzchnia etc.
var dt = 0;													//Czas rysowania modelu
var DeltaTime = 0;
var DeltaMouseRx = 0;										//Ostatnie przesunięcie myszki po x dla obrotu;
var DeltaMouseRy = 0;										//Ostatnie przesunięcie myszki po y dla obrotu;	
var DeltaMouseTx = 0;										//Ostatnie przesunięcie myszki po x dla przesuwu;
var DeltaMouseTy = 0;										//Ostatnie przesunięcie myszki po y dla przesuwu;			

var c = document.getElementById("Canva");					//Główna canva
var ctx = c.getContext("2d");

var c1 = document.createElement("Canvas");					//Wirtualna canva
var ctx1 = c1.getContext("2d");
c1.width = ctx.canvas.clientWidth;
c1.height = ctx.canvas.clientHeight

var StartTime = new Date();
var StopTime = new Date();
var DrawInterval;
var IsDrawing = false;
var DrawCount = 0;											//Licznik wywołania funkcji Draw
var IntervalsCount = 0;										//Licznik wywołania interwału czasowego
var Ind1 = 0;												//Indeks dla tablicy Particles
var GlobalGameTimer = 0;
var DrawLocked = false;
var GunSide = true;											//strona wyrzutni aktywnej

//Dokładnośc rysowania statku (0 - wolno, 1 - szybko)
DrawProcedure = 0;

var KeyPressed												//Wciśnięty klawisz

var OutPut = document.getElementById("Status2");				

//Statek gracza
var SHIP;
//Statek AI
var AI_SHIP;
var AI_Course_Timer = 2000;
var AI_Armed = document.getElementById("AI_Armed");
var AI_Control = document.getElementById("AI_Control");
var AI_TotalWar = document.getElementById("AI_TotalWar");
var AI_Number = document.getElementById("AI_Number");
var AI_Weapon = document.getElementById("AI_Weapon");
var AI_Guidance = document.getElementById("AI_Guidance");
var AI_Speed = document.getElementById("AI_Speed");
var AI_Reset = document.getElementById("AI_Reset");

var Turn_on_player_input = document.getElementById("Turn_on_player_input");
var Turn_on_serwer_call = document.getElementById("Turn_on_serwer_call");

//Wszystkie statki
var SHIPS = [];

//Sounds
var Default = new Sound('sounds/none.mp3');

var MissileStart1 = new Sound('sounds/missilestart1.mp3');
var MissileStart2 = new Sound('sounds/missilestart2.mp3');
var MissileStart3 = new Sound('sounds/missilestart3.mp3');
var MissileStart4 = new Sound('sounds/missilestart4.mp3');

var Explosion1 = new Sound('sounds/explosion1.mp3');
var Explosion2 = new Sound('sounds/explosion2.mp3');
var Explosion3 = new Sound('sounds/explosion3.mp3');

var Ricochet1 = new Sound('sounds/ricochet.mp3');

var GunFire1 = new Sound('sounds/gunfire1.mp3');
var GunFire2 = new Sound('sounds/gunfire2.mp3');
var GunFire3 = new Sound('sounds/gunfire3.mp3');
var GunFire4 = new Sound('sounds/gunfire4.mp3');
var GunFire5 = new Sound('sounds/gunfire5.mp3');
var GunFire6 = new Sound('sounds/gunfire6.mp3');
var GunFire7 = new Sound('sounds/gunfire7.mp3');
var GunFire8 = new Sound('sounds/gunfire8.mp3');

var LaserFire1 = new Sound('sounds/laserfire1.mp3');
var Electricity1 = new Sound('sounds/electricity1.mp3')
var Electricity2 = new Sound('sounds/electricity2.mp3')

//////////////////////////////////////////////////////////////////////////////////////////////////////

function AddParticle(P){	
	if ((P.sprite.id != 'smoke1')&&(P.sprite.alt != 'smoke')){
		for (var j = 0; j < Particles.length; j++){
			if (Particles[j].live <= 0){
				Ind1 = j;
				break;
			}
			Ind1 = j + 1;
		}
		Particles[Ind1] = P;
	}else{Smokes.push(P);}	
	if (Smokes.length > 5000){
		Smokes.shift();
	}
}

function CalculatePos(dTime,P){
	dTime = dTime/1000;
	if ((P.mass <= 0)||(P.Fuel <= 0)){
		P.vx = P.vx;
		P.vy = P.vy;
	}else{	
		P.vx += P.Fx/P.mass * dTime; 
		P.vy += P.Fy/P.mass * dTime; 
	}
	var V = Math.sqrt(P.vx*P.vx+P.vy*P.vy);
	if (V > P.vMax){P.vx = P.vMax*P.vx/V;P.vy = P.vMax*P.vy/V;}
	if(P!==SHIP){
		P.x += (P.vx-SHIP.vx) * dTime;
		P.y += (P.vy-SHIP.vy) * dTime;
	}else{
		//P.x += P.vx * dTime;
		//P.y += P.vy * dTime;
	}
	P.angle += P.rot * dTime;
}		

function ExplosionAnim(x,y,Radius,scale,angle,TimeScale,Particles,Sound){
	var V1 = 500*scale;
	var V2 = 1000*scale;
	var V3 = 800*scale;
	var Live = 700*TimeScale;
	var S = new Smoke(smoke3,x,y,0,0,0,0,(Math.random()-0.5)*3,0,0,0,Live,Live);
	S.dScale = Radius/(Live*smoke3.naturalHeight)*2*scale;				
	if(Sound!==undefined){Sound.Play(x,y);}
	for (var i = 0; i < Particles; i++){
		new Frag(frag1,x,y,(Math.random()-0.5)*V1,(Math.random()-0.5)*V1,0,0,0,(Math.random()-0.5)*3,0,scale*1,Math.random()*200*TimeScale);
		new Frag(frag1,x,y,(Math.random()-0.5)*V2,(Math.random()-0.5)*V2,0,0,0,(Math.random()-0.5)*3,0,scale*1.8,Math.random()*100*TimeScale);
		new Frag(frag1,x,y,(Math.random()-0.5)*V3,(Math.random()-0.5)*V3,0,0,0,(Math.random()-0.5)*3,0,scale*1.5,Math.random()*400*TimeScale);
		if (Math.random() < 0.1){
			F1 = new Smoke(SHIP.Parts[Math.round(Math.random()*(SHIP.Parts.length-1))].sprite,x,y,Math.cos(angle+(Math.random()-0.5)*2)*-V1*0.2,Math.sin(angle+(Math.random()-0.5)*2)*-V1*0.2,0,0,(Math.random()-0.5)*3,(Math.random()-0.5)*10,0,scale,Math.random()*3000*TimeScale,1000*TimeScale);
			F1.dScale = 0;
		}	
	}			
}

function Particle(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive){
	this.sprite = sprite;
	this.x = x;
	this.y = y;
	this.Dist = function(Object){return Math.sqrt((this.x-Object.x)*(this.x-Object.x)+(this.y-Object.y)*(this.y-Object.y));}
	this.vx = vx;
	this.vy = vy;
	this.V = function(){return Math.sqrt(this.vx*this.vx+this.vy*this.vy);}
	this.Fx = Fx;
	this.Fy = Fy;
	this.F = function(){return Math.sqrt(this.Fx*this.Fx+this.Fy*this.Fy);}
	this.angle = angle;
	this.rot = rot;	
	this.mass = mass;
	this.scale = scale;
	this.live = live;
	if (maxLive === undefined){this.maxLive = this.live;}else{this.maxLive = maxLive;}
	
	this.vMax = 500*this.scale;			
				
}

function Ship(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,AI){		
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);			
	this.Fuel = 100000;			
	this.ActiveWeapon = 5;
	this.GunTimer = 0;
	this.vMax = 200*scale;
	this.vMaxBase = 200*scale;
	this.AI_Course = {x:500,y:400};
	this.AI_Guidance = AI_Guidance.value;
	this.AI_Active = AI;
	this.AgonyLive = 1500;
	this.Destroyed = false;
	this.Target = undefined;
	
	this.SafeRadius = 50;						//Promień w prókym zawiera się cały statek (brany do sprawdzenia zniszczeń oraz hit testów)
	
	this.Weapons = [new Weapon_CPR7_Missile_Launcher(smoke1,this.x,this.y,0,0,0,0,0,0,10,this.scale,100,100,this),
					new Weapon_CPR9_Missile_Launcher(smoke1,this.x,this.y,0,0,0,0,0,0,10,this.scale,100,100,this),							
					new Weapon_P7_Missile_Launcher(smoke1,this.x,this.y,0,0,0,0,0,0,10,this.scale,100,100,this),
					new Weapon_Wulcan_R600(smoke1,this.x,this.y,0,0,0,0,0,0,10,this.scale,100,100,this),							
					new Weapon_Gauss_MG47(smoke1,this.x,this.y,0,0,0,0,0,0,10,this.scale,100,100,this),
					new Weapon_Lasers_LS3000(smoke1,this.x,this.y,0,0,0,0,0,0,10,this.scale,100,100,this),
					new Weapon_PlasmaGun_PY200(smoke1,this.x,this.y,0,0,0,0,0,0,10,this.scale,100,100,this),
					new Weapon_Nuke_Launcher(smoke1,this.x,this.y,0,0,0,0,0,0,10,this.scale,100,100,this)
	];
	this.Parts = [
		new Part(ship_part1L,this,34,4.5,0,1,10,100,100),
		new Part(ship_part2L,this,5,4,0,1,10,100,100),
		new Part(ship_part3L,this,24.5,12.5,0,1,10,100,100),
		new Part(ship_part4L,this,-7.5,7,0,1,10,100,100),
		new Part(ship_part5L,this,10,10.5,0,1,10,100,100),
		new Part(ship_part6L,this,-32.5,27,0,1,10,100,100),
		new Part(ship_part7L,this,2,27.5,0,1,10,100,100),
		new Part(ship_part8L,this,4,19.5,0,1,10,100,100),
		new Part(ship_part9L,this,-15,34.5,0,1,10,100,100),
		new Part(ship_part10L,this,-11.5,20,0,1,10,100,100),
		new Part(ship_part11L,this,-27,35.5,0,1,10,100,100),					
		new Part(ship_part12L,this,-28.5,15.5,0,1,10,100,100),					
		new Part(ship_part13L,this,-21,43.5,0,1,10,100,100),					
		new Part(ship_part14L,this,-21.5,24,0,1,10,100,100),					
		new Part(ship_part15L,this,-31,7,0,1,10,100,100),					
		new Part(ship_part16L,this,25,2,0,1,10,100,100),					
		new Part(ship_part17L,this,51,3,0,1,10,100,100),	
		
		new Part(ship_part1P,this,34,-4.5,0,1,10,100,100),
		new Part(ship_part2P,this,5,-4,0,1,10,100,100),
		new Part(ship_part3P,this,24.5,-12.5,0,1,10,100,100),
		new Part(ship_part4P,this,-7.5,-7,0,1,10,100,100),
		new Part(ship_part5P,this,11,-10.5,0,1,10,100,100),
		new Part(ship_part6P,this,-32.5,-27,0,1,10,100,100),
		new Part(ship_part7P,this,2,-27.5,0,1,10,100,100),
		new Part(ship_part8P,this,4,-19.5,0,1,10,100,100),
		new Part(ship_part9P,this,-15,-33.5,0,1,10,100,100),
		new Part(ship_part10P,this,-11.5,-20,0,1,10,100,100),
		new Part(ship_part11P,this,-27,-34.5,0,1,10,100,100),					
		new Part(ship_part12P,this,-28.5,-15.5,0,1,10,100,100),					
		new Part(ship_part13P,this,-21,-42.5,0,1,10,100,100),					
		new Part(ship_part14P,this,-21.5,-23,0,1,10,100,100),					
		new Part(ship_part15P,this,-31,-7,0,1,10,100,100),					
		new Part(ship_part16P,this,25,-2,0,1,10,100,100),					
		new Part(ship_part17P,this,51,-3,0,1,10,100,100),					
				];
	this.Damages = [
				
				];						
	
	this.HullLive = function(){
		var sum=0;
		for(var i=0;i<this.Parts.length;i++){
			if(!this.Parts[i].Destroyed){sum+=this.Parts[i].live;}
		}
		return sum;
	}
	
	this.Draw = function(dTime){
		if ((this.HullLive()>0)&&(!this.Destroyed)){
			ctx1.save();	
			ctx1.globalAlpha = 1.0;
			ctx1.translate(this.x,this.y);
			ctx1.rotate(this.angle);
			ctx1.scale(this.scale,this.scale);
			ctx1.translate(-this.sprite.naturalWidth/2,-this.sprite.naturalHeight/2);				
			if(DrawProcedure == 1){ctx1.drawImage(this.sprite,0,0)};	
				ctx1.font = "15px Arial";
				ctx1.fillStyle = "red";
				ctx1.textAlign = "center";
				var V = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
				//ctx1.fillText(Math.round(V,1),0,0);					
			ctx1.restore();
			if(DrawProcedure == 0){
				for (var i=0;i<this.Parts.length;i++){
					//Jeśli element nie jest zniszczony to go narysuj
					if(!this.Parts[i].Destroyed){
						this.Parts[i].Draw(dTime);
						//Dodaj rysunek zniszczenia
						if (this.Parts[i].Damages.length < Math.round((1-this.Parts[i].live/this.Parts[i].maxLive)*2)){
							this.Parts[i].Damages[this.Parts[i].Damages.length] = new Damage(damage1,this.Parts[i],(Math.random()-0.5)*this.Parts[i].sprite.naturalWidth*this.Parts[i].scale*this.scale,(Math.random()-0.5)*this.Parts[i].sprite.naturalHeight*this.Parts[i].scale*this.scale,(Math.random()-0.5)*0.2,this.scale*Math.random()*1+0.5,100,100,100,(Math.random()<0.1));
						}
						//Jeśli element został kompletnie zniszczony to oderwij go od statku
						if (this.Parts[i].live <= 0){
							this.Parts[i].Destroyed = true;
							this.Parts[i].live = 3500;
							this.Parts[i].maxLive = 3500;
							for (var j=0;j<this.Parts[i].Damages.length;j++){
								this.Parts[i].Damages[j].flame = true;
							}
							var PartV = -200*(Math.random()+1)/2*this.scale;
							this.Parts[i].vx = PartV * Math.cos(this.angle+(Math.random()-0.5)*2);
							this.Parts[i].vy = PartV * Math.sin(this.angle+(Math.random()-0.5)*2);
							if (Math.random() < 0.3){this.Damages[this.Damages.length] = new Damage(damage1,this,(Math.random()-0.5)*10*this.scale+this.Parts[i].x,(Math.random()-0.5)*10*this.scale+this.Parts[i].y,(Math.random()-0.5)*0.2,this.scale*Math.random()*1+1,100,100,100,(Math.random()<1.0))};
							var X = this.Parts[i].PartOf.x+this.Parts[i].x*Math.cos(this.Parts[i].PartOf.angle)+this.Parts[i].y*Math.sin(this.Parts[i].PartOf.angle);
							var Y = this.Parts[i].PartOf.y+this.Parts[i].x*Math.sin(this.Parts[i].PartOf.angle)-this.Parts[i].y*Math.cos(this.Parts[i].PartOf.angle);
							this.Parts[i].x = X;
							this.Parts[i].y = Y;							
							this.Parts[i].rot = (Math.random()-0.5)*10;	
							AddParticle(this.Parts[i]);
						}								
					}
				}
			}
			for (var i=0;i<this.Damages.length;i++){
				this.Damages[i].Draw();
			}
			
			
			//Środek statku
			ctx1.beginPath();
			//ctx1.arc(SHIP.x,SHIP.y,1,0,2*Math.PI);
			ctx1.stroke();					
			
			//Zużycie paliwa
			this.Fuel -= this.V()*dTime/1000;	
			
			//Obliczenie nowej pozycji
			CalculatePos(dTime,this);
		
			//Dym i ogień z dyszy silnika
			var V = Math.sqrt(this.vx*this.vx+this.vy*this.vy)*this.scale;					
			if ((V > 1)&&(this.Fuel > 0)&&(this.HullLive()>this.AgonyLive)){
				for (var i=0;i<10;i++){
					var x1 = -50*this.scale;
					var y1 = 0*this.scale;						
					var X = this.x+x1*Math.cos(this.angle)+y1*Math.sin(this.angle);
					var Y = this.y+x1*Math.sin(this.angle)-y1*Math.cos(this.angle);
					var Live = 300;
					var spread = 30*this.scale;							
					var S1 = new Smoke(smoke1,X,Y,-V*Math.cos(this.angle),-V*Math.sin(this.angle),0,0,0,0,0,this.scale*2.0,Live,3*Live);							
					S1.dScale = -0.004;							
					if(Math.random()>0.3){new Smoke(smoke2,X,Y,-V*Math.cos(this.angle)+(Math.random()-0.5)*spread,-V*Math.sin(this.angle)+(Math.random()-0.5)*spread,0,0,0,0,0,this.scale*1.0,Live,Live);}							
				}
			}				
		}
	}
	
	this.UseWeapon = function(){
		if (this.ActiveWeapons != -1){this.Weapons[this.ActiveWeapon].Fire(this.Target);}
	}

	this.AIcontrol = function(dTime,Target){
		AI_Course_Timer += dTime;
		if (AI_Course_Timer > 4000){
			AI_Course_Timer = 0;
			this.AI_Course.x = Math.random()*(document.body.clientWidth-300);
			this.AI_Course.y = Math.random()*(document.body.clientHeight-200);					
		}
		//Punkt celu AI
		var M = {x:this.AI_Course.x,y:this.AI_Course.y};
		//Gdzie celuje AI					
		if(Target !==undefined){
			var L = Math.sqrt((Target.x-this.x)*(Target.x-this.x)+(Target.y-this.y)*(Target.y-this.y));
			var MissileTime = L/this.Weapons[this.ActiveWeapon].MissileVMax;
			if(this.Weapons[this.ActiveWeapon].isGuided){MissileTime=0;}
			M.x = Target.x+Target.vx*MissileTime;
			M.y = Target.y+Target.vy*MissileTime;
		}
		//Pokaż w co celuje AI
		ctx1.beginPath();
		//ctx1.arc(M.x,M.y,3,0,2*Math.PI);
		ctx1.stroke();
		//Promień skrętu AI
		var L = Math.sqrt((this.x-Target.x)*(this.x-Target.x)+(this.y-Target.y)*(this.y-Target.y));
		var AttackRadius = 300*this.scale;
		var AttackBuffor = 20*this.scale;
			
		var Guide = L/AttackRadius;
		if(Guide>2){Guide=2;}
		if(Guide<0.2){Guide=0.2;}
		if(L<AttackRadius){var Q=(AttackRadius-L)/AttackBuffor;}
		if(L>=AttackRadius){var Q=(L-AttackRadius)/AttackBuffor;}
		if(Q>1){Q=1;}
		//if(Q<0.2){Q=0.1;}
		this.vMax = Q * this.vMaxBase;
		
		//Pokaż promienie ataku AI
		ctx1.beginPath();				
		//ctx1.arc(Target.x,Target.y,AttackRadius-AttackBuffor,0,2*Math.PI);
		ctx1.stroke();
		ctx1.beginPath();				
		//ctx1.arc(Target.x,Target.y,AttackRadius+AttackBuffor,0,2*Math.PI);
		ctx1.stroke();				
		//Promień skrętu AI
		var Radius = this.AI_Guidance * Guide;				
		
		var L = Math.sqrt((this.x - M.x)*(this.x - M.x) + (this.y - M.y)*(this.y - M.y));
		var sin = (M.y - this.y)/L;
		var cos = (M.x - this.x)/L;
		var angle = Math.atan2(sin,cos);
		
		var Lv = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
		if (Lv != 0){
			var sinv = this.vy/Lv;
			var cosv = this.vx/Lv;
			var anglev = Math.atan2(sinv,cosv);
		}else{
			var anglev = this.angle;
		}
		
		var ahead = angle-anglev;
		if(ahead > Math.PI){ahead -= 2*Math.PI;}
		if(ahead < -Math.PI){ahead += 2*Math.PI;}							
						
		var V = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
		if((Math.abs(this.Fx)+Math.abs(this.Fy)) == 0){this.Fx = 100000; this.Fy = 100000;}
		var F = Math.sqrt(this.Fx*this.Fx+this.Fy*this.Fy);
		
		var Guidance = (1+(Math.random()-0.5)*1)*Radius*dTime/1000;
		
		
		//Strzelaj jesli cel jest na linii lub poza linią ale tylko samonaprowadzający
		if(this.Weapons[this.ActiveWeapon].IsGuided){
			if((ahead < 1.5)&&(ahead > -1.5)&&(!Target.Destroyed)){	
				if(Math.random()<this.Weapons[this.ActiveWeapon].AIUsageRate){
					if(AI_Armed.checked){this.UseWeapon(Target);}
				}
			}
		}else{
			if((ahead < 0.1)&&(ahead > -0.1)&&(!Target.Destroyed)){	
				if(this.Weapons[this.ActiveWeapon].AIUsageRate!==undefined){
					if(Math.random()<this.Weapons[this.ActiveWeapon].AIUsageRate){
						if(AI_Armed.checked){this.UseWeapon(Target);}
					}
				}else{
					if(AI_Armed.checked){this.UseWeapon(Target);}
				}
			}					
		}
		
		
		if(ahead > 0.01){
			anglev += Guidance;
			//OutPut.innerHTML += '<br/>Plus';
		}
		if(ahead < -0.01){
			anglev -= Guidance;
			//OutPut.innerHTML += '<br/>Minus';
		}
		
		this.angle = anglev;
		this.vx = V * Math.cos(this.angle);
		this.vy = V * Math.sin(this.angle);
		this.Fx = F * Math.cos(this.angle);
		this.Fy = F * Math.sin(this.angle);	
		
		//Jeśli AI jest wyłączone to
		if(!AI_Control.checked){
			this.vx = 0;
			this.vy = 0;
			this.Fx = 0;
			this.Fy = 0;
			//this.angle = 0;
		}
	}

	this.ShipExplosion = function(){
		this.Destroyed = true;				
		this.Frag = new Weapon_Frag_Launcher(missile1,0,0,0,0,0,0,0,0,0,this.scale,100,100,this,10,0,0.3);
		ExplosionAnim(this.x,this.y,150,this.scale*1,this.angle,3*this.scale,5,Explosion3);
		for(var i=0;i<100;i++){
			var V = 150*this.scale;
			var Radius = 300*this.scale;
			var anglev = Math.random()*2*Math.PI;
			var M = new MissileFrag(frag1,this.x,this.y,V*Math.cos(anglev),V*Math.sin(anglev),0,0,anglev,0,25,this.scale*0.4,Radius*this.scale,Radius*this.scale,this.Frag);							
		}
		for (var i=0;i<this.Parts.length;i++){
			if (!this.Parts[i].Destroyed){
				this.Parts[i].Destroyed = true;
				this.Parts[i].live = 3500;
				this.Parts[i].maxLive = 3500;
				for (var j=0;j<this.Parts[i].Damages.length;j++){
					this.Parts[i].Damages[j].flame = true;
				}
				var PartV = -200*(Math.random()+1)/2*this.scale;
				this.Parts[i].vx = PartV * Math.cos(this.angle+(Math.random()-0.5)*2);
				this.Parts[i].vy = PartV * Math.sin(this.angle+(Math.random()-0.5)*2);
				if (Math.random() < 0.3){this.Damages[this.Damages.length] = new Damage(damage1,this,(Math.random()-0.5)*10*this.scale+this.Parts[i].x,(Math.random()-0.5)*10*this.scale+this.Parts[i].y,(Math.random()-0.5)*0.2,this.scale*Math.random()*1+1,100,100,100,(Math.random()<1.0))};
				var X = this.Parts[i].PartOf.x+this.Parts[i].x*Math.cos(this.Parts[i].PartOf.angle)+this.Parts[i].y*Math.sin(this.Parts[i].PartOf.angle);
				var Y = this.Parts[i].PartOf.y+this.Parts[i].x*Math.sin(this.Parts[i].PartOf.angle)-this.Parts[i].y*Math.cos(this.Parts[i].PartOf.angle);
				this.Parts[i].x = X;
				this.Parts[i].y = Y;							
				this.Parts[i].rot = (Math.random()-0.5)*10;	
				AddParticle(this.Parts[i]);
			}
		}
		this.vx = 0;
		this.vy = 0;
		this.Fx = 0;
		this.Fy = 0;
	}
}

function MissileRocket(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,Weapon){			
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);			
	this.Fuel = Weapon.MissileFuel;
	this.Destroyed = false;
	this.Weapon = Weapon;
	
	AddParticle(this);
	
	this.Guide = function(dTime){
		//Samonaprowadzająca					
		if((this.Fuel > 0)&&(this.Weapon.IsGuided)&&(this.Target !== undefined)){
			var M = {x:this.Target.x,y:this.Target.y};
			var L = Math.sqrt((this.x - M.x)*(this.x - M.x) + (this.y - M.y)*(this.y - M.y));
			var sin = (M.y - this.y)/L;
			var cos = (M.x - this.x)/L;
			var angle = Math.atan2(sin,cos);
			
			var Lv = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
			if (Lv != 0){
				var sinv = this.vy/Lv;
				var cosv = this.vx/Lv;
				var anglev = Math.atan2(sinv,cosv);
			}else{
				var anglev = this.angle;
			}
			
			var ahead = angle-anglev;
			if(ahead > Math.PI){ahead -= 2*Math.PI;}
			if(ahead < -Math.PI){ahead += 2*Math.PI;}							
			
			//OutPut.innerHTML = '<br/>MissileVec = '+Math.round(anglev*180/Math.PI,2);
			//OutPut.innerHTML += '<br/>ShipToMissileVec = '+Math.round(ahead*180/Math.PI,2);			
			
			var V = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
			var F = Math.sqrt(this.Fx*this.Fx+this.Fy*this.Fy);
			
			var Guidance = (1+(Math.random()-0.5)*1)*this.Weapon.Guidance*dTime/1000;
			
			if(ahead > 0.2){
				if (ahead < Guidance){anglev += ahead;}else{anglev += Guidance;}
				//OutPut.innerHTML += '<br/>Plus';
			}
			if(ahead < -0.2){
				if (Math.abs(ahead) < Guidance){anglev -= ahead;}else{anglev -= Guidance;}
				//OutPut.innerHTML += '<br/>Minus';
			}
			V = this.vMax;
			this.angle = anglev;
			this.vx = V * Math.cos(this.angle);
			this.vy = V * Math.sin(this.angle);
			this.Fx = F * Math.cos(this.angle);
			this.Fy = F * Math.sin(this.angle);								
		}else{												
								
		}
	
	}
	
	this.Draw = function(dTime){
		if (this.live > 0){
			ctx1.save();	
			ctx1.globalAlpha = 1.0;
			ctx1.translate(this.x,this.y);
			ctx1.rotate(this.angle);
			ctx1.scale(this.scale,this.scale);
			ctx1.translate(-this.sprite.naturalWidth/2,-this.sprite.naturalHeight/2);				
			ctx1.drawImage(this.sprite,0,0);	
				ctx1.font = "15px Arial";
				ctx1.fillStyle = "red";
				ctx1.textAlign = "center";
				//ctx1.fillText(Math.round(this.live,0),0,0);
				//ctx1.fillText(Math.round(this.Fuel,0),0,0);
			ctx1.restore();
			
			//Dym z dyszy silnika
			if(this.Fuel > 0){
				var t = 100;//prędkość wylatującego dymu z dyszy
				t -= Math.sqrt(this.vx*this.vx+this.vy*this.vy);
				if (t<0){t=0;}
				for (var i=0;i<3;i++){
					var x1 = (-25-i*2)*this.scale;
					var y1 = 0*this.scale;						
					var X = this.x+x1*Math.cos(this.angle)+y1*Math.sin(this.angle);
					var Y = this.y+x1*Math.sin(this.angle)-y1*Math.cos(this.angle);
					var Live = 1000;
					if(Math.random() < this.Fuel/1000*3){new Smoke(smoke1,X,Y,-t*Math.cos(this.angle)+(Math.random()-0.5)*10,-t*Math.sin(this.angle)+(Math.random()-0.5)*10,0,0,0,0,0,this.scale*0.7,Live,Live);}
				}
			}else{
				this.rot = 1;
				this.live -= 1;
			}
			//Zużycie paliwa
			this.Fuel -= this.V()*dTime/1000;
			//Obliczenie nowej pozycji
			this.Guide(dTime);
			CalculatePos(dTime,this);
								
			//Sprawdzenie czy nie ma wybuchu
			for (var i=0;i<SHIPS.length;i++){				
				if (!SHIPS[i].Destroyed){this.Explosion(SHIPS[i]);}
			}
			this.Explosion(SHIP);
		}
	}

	this.Explosion = function(TMP_SHIP){
		if (TMP_SHIP !== this.Weapon.WeaponOwner){
			var L = this.Dist(TMP_SHIP);//Math.sqrt((this.x-TMP_SHIP.x)*(this.x-TMP_SHIP.x)+(this.y-TMP_SHIP.y)*(this.y-TMP_SHIP.y));
			ctx1.beginPath();
			//ctx1.arc(TMP_SHIP.x,TMP_SHIP.y,40,0,2*Math.PI);
			ctx1.stroke();
			if (((this.live <= 0)&&(!this.Destroyed))||((L < TMP_SHIP.SafeRadius*TMP_SHIP.scale)&&(!TMP_SHIP.Destroyed))){
				this.live = 0;	
				this.Destroyed = true;
				ExplosionAnim(this.x,this.y,this.Weapon.DmgRadius,this.scale,this.angle,1,this.Weapon.ExplosionParticles,this.Weapon.BlastSound);							
				
//TU POPRAWIĆ!!

				
				/*for(var i=0;i<TMP_SHIP.Parts.length;i++){
					var X = TMP_SHIP.Parts[i].PartOf.x+TMP_SHIP.Parts[i].x*Math.cos(TMP_SHIP.Parts[i].PartOf.angle)+TMP_SHIP.Parts[i].y*Math.sin(TMP_SHIP.Parts[i].PartOf.angle);
					var Y = TMP_SHIP.Parts[i].PartOf.y+TMP_SHIP.Parts[i].x*Math.sin(TMP_SHIP.Parts[i].PartOf.angle)-TMP_SHIP.Parts[i].y*Math.cos(TMP_SHIP.Parts[i].PartOf.angle);
					var Dist = Math.sqrt((this.x-X)*(this.x-X)+(this.y-Y)*(this.y-Y));
					if(Dist<this.Weapon.DmgRadius){		
						//Odejmij HP odelementu uderzonego
						TMP_SHIP.Parts[i].live -= this.Weapon.BaseDmg;
						//Dodaj rysunek zniszczenia
						if (TMP_SHIP.Parts[i].Damages.length < Math.round((1-TMP_SHIP.Parts[i].live/TMP_SHIP.Parts[i].maxLive)*2)){
							TMP_SHIP.Parts[i].Damages[TMP_SHIP.Parts[i].Damages.length] = new Damage(damage1,TMP_SHIP.Parts[i],(Math.random()-0.5)*TMP_SHIP.Parts[i].sprite.naturalWidth*TMP_SHIP.Parts[i].scale*TMP_SHIP.scale,(Math.random()-0.5)*TMP_SHIP.Parts[i].sprite.naturalHeight*TMP_SHIP.Parts[i].scale*TMP_SHIP.scale,(Math.random()-0.5)*0.2,TMP_SHIP.scale*Math.random()*1+0.5,100,100,100,(Math.random()<0.3));
						}
						//Pokrzyw uderzony element
						TMP_SHIP.Parts[i].angle += (Math.random()-0.5)*0.2;
						TMP_SHIP.Parts[i].x += (Math.random()-0.5)*2;
						TMP_SHIP.Parts[i].x += (Math.random()-0.5)*2;									
						//Siła uderzenia dodana do celu
						var F = this.Weapon.HitForce;
						var cos = (this.x-TMP_SHIP.x)/L;
						var sin = (this.y-TMP_SHIP.y)/L;
						TMP_SHIP.vx -= F*cos;
						TMP_SHIP.vy -= F*sin;								
					}
				}//*/
				
				//FRAG BLAST!
				for(var i=0;i<this.Weapon.Frags;i++){
					var V = this.Weapon.BlastSpeed;//this.Weapon.DmgRadius*1.5;
					var anglev = Math.random()*2*Math.PI;
					var M = new MissileFrag(frag1,this.x,this.y,V*Math.cos(anglev),V*Math.sin(anglev),0,0,anglev,0,25,this.Weapon.WeaponOwner.scale*(0.2+Math.random()*0.8),this.Weapon.DmgRadius,this.Weapon.DmgRadius,this.Weapon.Frag);							
				}//*/
			}
		}
	}
}

function MissilePackedRocket(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,Weapon){			
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);			
	this.Fuel = Weapon.MissileFuel;
	this.Destroyed = false;
	this.Weapon = Weapon;
	
	AddParticle(this);
	
	this.Guide = function(dTime){
		//Samonaprowadzająca					
		if((this.Fuel > 0)&&(this.Weapon.IsGuided)&&(this.Target !== undefined)){
			var M = {x:this.Target.x,y:this.Target.y};
			var L = Math.sqrt((this.x - M.x)*(this.x - M.x) + (this.y - M.y)*(this.y - M.y));
			var sin = (M.y - this.y)/L;
			var cos = (M.x - this.x)/L;
			var angle = Math.atan2(sin,cos);
			
			var Lv = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
			if (Lv != 0){
				var sinv = this.vy/Lv;
				var cosv = this.vx/Lv;
				var anglev = Math.atan2(sinv,cosv);
			}else{
				var anglev = this.angle;
			}
			
			var ahead = angle-anglev;
			if(ahead > Math.PI){ahead -= 2*Math.PI;}
			if(ahead < -Math.PI){ahead += 2*Math.PI;}							
			
			//OutPut.innerHTML = '<br/>MissileVec = '+Math.round(anglev*180/Math.PI,2);
			//OutPut.innerHTML += '<br/>ShipToMissileVec = '+Math.round(ahead*180/Math.PI,2);			
			
			var V = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
			var F = Math.sqrt(this.Fx*this.Fx+this.Fy*this.Fy);
			
			var Guidance = (1+(Math.random()-0.5)*1)*this.Weapon.Guidance*dTime/1000;
			
			if(ahead > 0.2){
				if (ahead < Guidance){anglev += ahead;}else{anglev += Guidance;}
				//OutPut.innerHTML += '<br/>Plus';
			}
			if(ahead < -0.2){
				if (Math.abs(ahead) < Guidance){anglev -= ahead;}else{anglev -= Guidance;}
				//OutPut.innerHTML += '<br/>Minus';
			}
			
			V = this.vMax;
			this.angle = anglev;
			this.vx = V * Math.cos(this.angle);
			this.vy = V * Math.sin(this.angle);
			this.Fx = F * Math.cos(this.angle);
			this.Fy = F * Math.sin(this.angle);								
		}else{												
								
		}
	
	}
	
	this.Draw = function(dTime){
		if (this.live > 0){
			ctx1.save();	
			ctx1.globalAlpha = 1.0;
			ctx1.translate(this.x,this.y);
			ctx1.rotate(this.angle);
			ctx1.scale(this.scale,this.scale);
			ctx1.translate(-this.sprite.naturalWidth/2,-this.sprite.naturalHeight/2);				
			ctx1.drawImage(this.sprite,0,0);	
				ctx1.font = "15px Arial";
				ctx1.fillStyle = "red";
				ctx1.textAlign = "center";
				//ctx1.fillText(Math.round(this.live,0),0,0);
				//ctx1.fillText(Math.round(this.Fuel,0),0,0);						
			ctx1.restore();
			
			//Dym z dyszy silnika
			if(this.Fuel > 0){
				var t = 100;//prędkość wylatującego dymu z dyszy
				t = t - Math.sqrt(this.vx*this.vx+this.vy*this.vy);
				if (t<0){t=0;}
				for (var i=0;i<3;i++){
					var x1 = (-25-i*2)*this.scale;
					var y1 = 0*this.scale;						
					var X = this.x+x1*Math.cos(this.angle)+y1*Math.sin(this.angle);
					var Y = this.y+x1*Math.sin(this.angle)-y1*Math.cos(this.angle);
					var Live = 1000;
					if(Math.random() < this.Fuel/1000*3){new Smoke(smoke1,X,Y,-t*Math.cos(this.angle)+(Math.random()-0.5)*10,-t*Math.sin(this.angle)+(Math.random()-0.5)*10,0,0,0,0,0,this.scale*0.7,Live,Live);}
				}
			}else{
				this.rot = 1;
				this.live -= 1;
			}
			//Zużycie paliwa
			this.Fuel -= this.V()*dTime/1000;
			
			//Obliczenie nowej pozycji
			this.Guide(dTime);
			CalculatePos(dTime,this);					
			
			//Sprawdzenie czy nie ma wybuchu
			for (var i=0;i<SHIPS.length;i++){				
				if (!SHIPS[i].Destroyed){this.Explosion(SHIPS[i]);}
			}
			this.Explosion(SHIP);
		}
	}

	this.Explosion = function(TMP_SHIP){
		if (TMP_SHIP !== this.Weapon.WeaponOwner){
			var L = Math.sqrt((this.x-TMP_SHIP.x)*(this.x-TMP_SHIP.x)+(this.y-TMP_SHIP.y)*(this.y-TMP_SHIP.y));
			if(this.Target !== undefined){
				var L1 = Math.sqrt((this.x-this.Target.x)*(this.x-this.Target.x)+(this.y-this.Target.y)*(this.y-this.Target.y));
			}else{
				var L1 =1000000;
			}
			ctx1.beginPath();
			//ctx1.arc(TMP_SHIP.x,TMP_SHIP.y,40,0,2*Math.PI);
			ctx1.stroke();
			if (((this.live <= 0)||((L1 < 350*TMP_SHIP.scale)&&(this.Fuel < 0.7*this.Weapon.MissileFuel))||(L < 50*TMP_SHIP.scale))&&(!this.Destroyed)){
				this.live = 0;	
				this.Destroyed = true;
				ExplosionAnim(this.x,this.y,this.Weapon.DmgRadius,this.scale,this.angle,1,this.Weapon.ExplosionParticles,this.Weapon.BlastSound);
				//Add_Cmd_Text('Explosion');
				
				for(var i=0;i<this.Weapon.Frags;i++){
					var anglev = this.angle+(Math.random()-0.5)*0.7*Math.PI;
					var V = 0*this.Weapon.WeaponOwner.scale;
					var F = 1000000*this.Weapon.WeaponOwner.scale;
					var vx = V*Math.cos(this.angle);
					var vy = V*Math.sin(this.angle);
					var Fx = F*Math.cos(this.angle);
					var Fy = F*Math.sin(this.angle);
					var M = new MissileRocket(missile1,this.x,this.y,vx,vy,Fx,Fy,anglev,0,25,this.Weapon.WeaponOwner.scale*0.7,this.Weapon.DmgRadius,this.Weapon.DmgRadius,this.Weapon.Frag);							
					M.vMax = 1800*this.Weapon.WeaponOwner.scale;
					M.Weapon.Guidance = 15;
					M.Target = this.Target;
				}
			}
		}
	}
}		

function MissileLaser(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,Weapon){			
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);			
	this.Fuel = Weapon.MissileFuel;
	this.Weapon = Weapon;
	
	AddParticle(this);
	
	this.Guide = function(dTime,Target){
		//Samonaprowadzająca					
		if((this.Fuel > 0)&&(this.Weapon.IsGuided)&&(Target !== undefined)){
			var M = {x:Target.x,y:Target.y};
			var L = Math.sqrt((this.x - M.x)*(this.x - M.x) + (this.y - M.y)*(this.y - M.y));
			var sin = (M.y - this.y)/L;
			var cos = (M.x - this.x)/L;
			var angle = Math.atan2(sin,cos);
			
			var Lv = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
			if (Lv != 0){
				var sinv = this.vy/Lv;
				var cosv = this.vx/Lv;
				var anglev = Math.atan2(sinv,cosv);
			}else{
				var anglev = this.angle;
			}
			
			var ahead = angle-anglev;
			if(ahead > Math.PI){ahead -= 2*Math.PI;}
			if(ahead < -Math.PI){ahead += 2*Math.PI;}							
			
			//OutPut.innerHTML = '<br/>MissileVec = '+Math.round(anglev*180/Math.PI,2);
			//OutPut.innerHTML += '<br/>ShipToMissileVec = '+Math.round(ahead*180/Math.PI,2);			
			
			var V = 0.9*Math.sqrt(this.vx*this.vx+this.vy*this.vy);
			var F = Math.sqrt(this.Fx*this.Fx+this.Fy*this.Fy);
			
			var Guidance = (1+(Math.random()-0.5)*1)*this.Weapon.Guidance*dTime/1000;
			
			if(ahead > 0.2){
				if (ahead < Guidance){anglev += ahead;}else{anglev += Guidance;}
				//OutPut.innerHTML += '<br/>Plus';
			}
			if(ahead < -0.2){
				if (Math.abs(ahead) < Guidance){anglev -= ahead;}else{anglev -= Guidance;}
				//OutPut.innerHTML += '<br/>Minus';
			}
			
			this.angle = anglev;
			this.vx = V * Math.cos(this.angle);
			this.vy = V * Math.sin(this.angle);
			this.Fx = F * Math.cos(this.angle);
			this.Fy = F * Math.sin(this.angle);								
		}else{												
								
		}
	
	}
	
	this.Draw = function(dTime){
		if (this.live > 0){
			ctx1.save();	
			ctx1.globalAlpha = 1;
			ctx1.translate(this.x,this.y);
			ctx1.rotate(this.angle);
			ctx1.scale(this.scale,this.scale);
			ctx1.translate(-this.sprite.naturalWidth/2,-this.sprite.naturalHeight/2);				
			ctx1.drawImage(this.sprite,0,0);	
				ctx1.font = "15px Arial";
				ctx1.fillStyle = "red";
				ctx1.textAlign = "center";
				//ctx1.fillText(Math.round(this.live,0),0,0);
				//ctx1.fillText(Math.round(this.Fuel,0),0,0);
			ctx1.restore();
			
			//Zużycie paliwa
			this.Fuel -= this.V()*dTime/1000;
			if(this.Fuel < 0){this.live -= this.V()*dTime/1000;;}
		
			//Obliczenie nowej pozycji
			CalculatePos(dTime,this);
			
			//Sprawdzenie czy nie ma wybuchu
			for (var i=0;i<SHIPS.length;i++){				
				if (!SHIPS[i].Destroyed){this.Explosion(SHIPS[i]);}
			}
			this.Explosion(SHIP);
		}
	}

	this.Explosion = function(TMP_SHIP){
		if(TMP_SHIP !== this.Weapon.WeaponOwner){
			var L = Math.sqrt((this.x-TMP_SHIP.x)*(this.x-TMP_SHIP.x)+(this.y-TMP_SHIP.y)*(this.y-TMP_SHIP.y));
			var HitRadius = 50;
			//Narysuj promień dokładnej analizy
			ctx1.beginPath();
			//ctx1.arc(TMP_SHIP.x,TMP_SHIP.y,HitRadius*TMP_SHIP.scale,0,2*Math.PI);
			ctx1.stroke();
			
			for(var i=0;i<TMP_SHIP.Parts.length;i++){
				//Dla jeszcze istniejących elementów sprawdz czy zostały uderzone
				if(TMP_SHIP.Parts[i].live > 0){
					var X = TMP_SHIP.Parts[i].PartOf.x+TMP_SHIP.Parts[i].x*Math.cos(TMP_SHIP.Parts[i].PartOf.angle)+TMP_SHIP.Parts[i].y*Math.sin(TMP_SHIP.Parts[i].PartOf.angle);
					var Y = TMP_SHIP.Parts[i].PartOf.y+TMP_SHIP.Parts[i].x*Math.sin(TMP_SHIP.Parts[i].PartOf.angle)-TMP_SHIP.Parts[i].y*Math.cos(TMP_SHIP.Parts[i].PartOf.angle);
					var Dist = Math.sqrt((this.x-X)*(this.x-X)+(this.y-Y)*(this.y-Y));
					//Dokładna analiza dla każdego elementu statku
					if (Dist < 10*TMP_SHIP.scale){
						//Play blast sound
						this.Weapon.BlastSound.Play(this.x,this.y);
						//Odejmij HP odelementu uderzonego
						TMP_SHIP.Parts[i].live -= this.Weapon.BaseDmg;
						//Pokrzyw uderzony element
						TMP_SHIP.Parts[i].angle += (Math.random()-0.5)*0.2;
						TMP_SHIP.Parts[i].x += (Math.random()-0.5)*2;
						TMP_SHIP.Parts[i].x += (Math.random()-0.5)*2;									
						//Siła uderzenia dodana do celu
						var F = this.Weapon.HitForce;
						var cos = (this.x-TMP_SHIP.x)/L;
						var sin = (this.y-TMP_SHIP.y)/L;
						TMP_SHIP.vx -= F*cos;
						TMP_SHIP.vy -= F*sin;
						//Penetracja celu									
						var TmpLive = this.live;
						if(Math.random()>this.Weapon.Penetration){
							this.live = 0;
						}
						//Odbicie pocisku
						if(Math.random()<this.Weapon.Bounce){
							this.live = TmpLive;
							this.vx = -this.vx;
							this.vy = -this.vy;
							var Lv = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
							if (Lv != 0){
								var sinv = this.vy/Lv;
								var cosv = this.vx/Lv;
								var anglev = Math.atan2(sinv,cosv);
							}else{
								var anglev = this.angle;
							}
							anglev += 3*(Math.random()-0.5);
							var V = Math.sqrt((this.vx*this.vx)+(this.vy*this.vy));
							this.vx = V*Math.cos(anglev);
							this.vy = V*Math.sin(anglev);
							this.angle = anglev;
						}
					}							
				}														
			}
		}
	}
}

function MissileFrag(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,Weapon){			
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);			
	this.Fuel = Weapon.MissileFuel;
	this.Weapon = Weapon;
	
	AddParticle(this);
	
	this.Guide = function(dTime,Target){
		//Samonaprowadzająca					
		if((this.Fuel > 0)&&(this.Weapon.IsGuided)&&(Target !== undefined)){
			var M = {x:Target.x,y:Target.y};
			var L = Math.sqrt((this.x - M.x)*(this.x - M.x) + (this.y - M.y)*(this.y - M.y));
			var sin = (M.y - this.y)/L;
			var cos = (M.x - this.x)/L;
			var angle = Math.atan2(sin,cos);
			
			var Lv = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
			if (Lv != 0){
				var sinv = this.vy/Lv;
				var cosv = this.vx/Lv;
				var anglev = Math.atan2(sinv,cosv);
			}else{
				var anglev = this.angle;
			}
			
			var ahead = angle-anglev;
			if(ahead > Math.PI){ahead -= 2*Math.PI;}
			if(ahead < -Math.PI){ahead += 2*Math.PI;}							
			
			//OutPut.innerHTML = '<br/>MissileVec = '+Math.round(anglev*180/Math.PI,2);
			//OutPut.innerHTML += '<br/>ShipToMissileVec = '+Math.round(ahead*180/Math.PI,2);			
			
			var V = 0.9*Math.sqrt(this.vx*this.vx+this.vy*this.vy);
			var F = Math.sqrt(this.Fx*this.Fx+this.Fy*this.Fy);
			
			var Guidance = (1+(Math.random()-0.5)*1)*this.Weapon.Guidance*dTime/1000;
			
			if(ahead > 0.2){
				if (ahead < Guidance){anglev += ahead;}else{anglev += Guidance;}
				//OutPut.innerHTML += '<br/>Plus';
			}
			if(ahead < -0.2){
				if (Math.abs(ahead) < Guidance){anglev -= ahead;}else{anglev -= Guidance;}
				//OutPut.innerHTML += '<br/>Minus';
			}
			
			this.angle = anglev;
			this.vx = V * Math.cos(this.angle);
			this.vy = V * Math.sin(this.angle);
			this.Fx = F * Math.cos(this.angle);
			this.Fy = F * Math.sin(this.angle);								
		}else{												
								
		}
	
	}
	
	this.Draw = function(dTime){
		if (this.live > 0){
			ctx1.save();	
			ctx1.globalAlpha = this.live/this.maxLive;
			ctx1.translate(this.x,this.y);
			ctx1.rotate(this.angle);
			ctx1.scale(this.scale,this.scale);
			ctx1.translate(-this.sprite.naturalWidth/2,-this.sprite.naturalHeight/2);				
			ctx1.drawImage(this.sprite,0,0);	
				ctx1.font = "15px Arial";
				ctx1.fillStyle = "red";
				ctx1.textAlign = "center";
				//ctx1.fillText(Math.round(this.live,0),0,0);
				//ctx1.fillText(Math.round(this.Fuel,0),0,0);
			ctx1.restore();					
			
			//Zużycie paliwa
			this.Fuel -= this.V()*dTime/1000;
			if(this.Fuel <= 0){this.live -= this.V()*dTime/1000;}	
		
			//Obliczenie nowej pozycji
			CalculatePos(dTime,this);
			
			//Sprawdzenie czy nie ma wybuchu
			for (var i=0;i<SHIPS.length;i++){				
				if (!SHIPS[i].Destroyed){this.Explosion(SHIPS[i]);}
			}
			this.Explosion(SHIP);
		}
	}

	this.Explosion = function(TMP_SHIP){
		if(TMP_SHIP !== this.Weapon.WeaponOwner){
			var L = Math.sqrt((this.x-TMP_SHIP.x)*(this.x-TMP_SHIP.x)+(this.y-TMP_SHIP.y)*(this.y-TMP_SHIP.y));
			var HitRadius = 50;
			//Narysuj promień dokładnej analizy
			ctx1.beginPath();
			//ctx1.arc(TMP_SHIP.x,TMP_SHIP.y,HitRadius*TMP_SHIP.scale,0,2*Math.PI);
			ctx1.stroke();

			for(var i=0;i<TMP_SHIP.Parts.length;i++){
				//Dla jeszcze istniejących elementów sprawdz czy zostały uderzone
				if(TMP_SHIP.Parts[i].live > 0){
					var X = TMP_SHIP.Parts[i].PartOf.x+TMP_SHIP.Parts[i].x*Math.cos(TMP_SHIP.Parts[i].PartOf.angle)+TMP_SHIP.Parts[i].y*Math.sin(TMP_SHIP.Parts[i].PartOf.angle);
					var Y = TMP_SHIP.Parts[i].PartOf.y+TMP_SHIP.Parts[i].x*Math.sin(TMP_SHIP.Parts[i].PartOf.angle)-TMP_SHIP.Parts[i].y*Math.cos(TMP_SHIP.Parts[i].PartOf.angle);
					var Dist = Math.sqrt((this.x-X)*(this.x-X)+(this.y-Y)*(this.y-Y));
					//Dokładna analiza dla każdego elementu statku
					if (Dist < 10*TMP_SHIP.scale){
						//Play blast sound
						this.Weapon.BlastSound.Play(this.x,this.y);
						//Odejmij HP odelementu uderzonego
						TMP_SHIP.Parts[i].live -= this.Weapon.BaseDmg;
						//Dodaj rysunek zniszczenia
						if (TMP_SHIP.Parts[i].Damages.length < Math.round((1-TMP_SHIP.Parts[i].live/TMP_SHIP.Parts[i].maxLive)*2)){
							TMP_SHIP.Parts[i].Damages[TMP_SHIP.Parts[i].Damages.length] = new Damage(damage1,TMP_SHIP.Parts[i],(Math.random()-0.5)*TMP_SHIP.Parts[i].sprite.naturalWidth*TMP_SHIP.Parts[i].scale*TMP_SHIP.scale,(Math.random()-0.5)*TMP_SHIP.Parts[i].sprite.naturalHeight*TMP_SHIP.Parts[i].scale*TMP_SHIP.scale,(Math.random()-0.5)*0.2,TMP_SHIP.scale*Math.random()*1+0.5,100,100,100,(Math.random()<0.1));
						}
						//Pokrzyw uderzony element
						TMP_SHIP.Parts[i].angle += (Math.random()-0.5)*0.2;
						TMP_SHIP.Parts[i].x += (Math.random()-0.5)*2;
						TMP_SHIP.Parts[i].x += (Math.random()-0.5)*2;									
						//Siła uderzenia dodana do celu
						var F = this.Weapon.HitForce;
						var cos = (this.x-TMP_SHIP.x)/L;
						var sin = (this.y-TMP_SHIP.y)/L;
						TMP_SHIP.vx -= F*cos;
						TMP_SHIP.vy -= F*sin;
						//Penetracja celu									
						var TmpLive = this.live;
						if(Math.random()>this.Weapon.Penetration){
							this.live = 0;
						}
						//Odbicie pocisku
						if(Math.random()<this.Weapon.Bounce){
							this.live = TmpLive;
							this.vx = -this.vx;
							this.vy = -this.vy;
							var Lv = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
							if (Lv != 0){
								var sinv = this.vy/Lv;
								var cosv = this.vx/Lv;
								var anglev = Math.atan2(sinv,cosv);
							}else{
								var anglev = this.angle;
							}
							anglev += 3*(Math.random()-0.5);
							var V = Math.sqrt((this.vx*this.vx)+(this.vy*this.vy));
							this.vx = V*Math.cos(anglev);
							this.vy = V*Math.sin(anglev);
							this.angle = anglev;
						}
					}							
				}														
			}
		}
	}
}

function Frag(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive){			
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	this.dScale = -0.004;
	AddParticle(this);
	
	this.Draw = function(dTime){
		if (this.live > 0){
			ctx1.save();	
			ctx1.globalAlpha = this.live/this.maxLive;
			ctx1.translate(this.x,this.y);
			ctx1.rotate(this.angle);
			ctx1.scale(this.scale,this.scale);
			ctx1.translate(-this.sprite.naturalWidth/2,-this.sprite.naturalHeight/2);				
			ctx1.drawImage(this.sprite,0,0);						
			ctx1.restore();
			
			//Ślad z dymu
			if(Math.random() > 0.3){new Smoke(smoke1,this.x,this.y,(Math.random()-0.5)*3,(Math.random()-0.5)*3,0,0,0,0,0,this.scale*0.7,2000);}
			
			//Obliczenie nowej pozycji
			CalculatePos(dTime,this);
			//Czas życia
			this.live -= dTime;
			//Zmiana skali obiektu
			this.scale += this.dScale*dTime
			if (this.scale < 0){this.scale = 0.001;}
		}	
	}
}

function Smoke(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive){			
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	this.dScale = 0.0005;
	AddParticle(this);
	
	this.Draw = function(dTime){
		if (this.live > 0){
			ctx1.save();	
			ctx1.globalAlpha = this.live/this.maxLive;
			ctx1.translate(this.x,this.y);
			ctx1.rotate(this.angle);
			ctx1.scale(this.scale,this.scale);
			ctx1.translate(-this.sprite.naturalWidth/2,-this.sprite.naturalHeight/2);				
			ctx1.drawImage(this.sprite,0,0);						
			ctx1.restore();
			
			//Obliczenie nowej pozycji
			CalculatePos(dTime,this);
			//Czas życia
			this.live -= dTime;
			//Zmiana skali obiektu
			this.scale += this.dScale*dTime
		}
	}
}

function Part(sprite,PartOf,x,y,angle,scale,mass,live,maxLive){			
	Particle.call(this,sprite,x*PartOf.scale,y*PartOf.scale,0,0,0,0,0,0,mass,scale,live,maxLive);
	this.PartOf = PartOf;
	this.Destroyed = false;
	this.dScale = 0.000;
	
	this.Damages = [
		
	];
	
	this.Draw = function(dTime){
		if (!this.Destroyed){
			if(this.live > 0){
				ctx1.save();	
				var X = this.PartOf.x+this.x*Math.cos(this.PartOf.angle)+this.y*Math.sin(this.PartOf.angle);
				var Y = this.PartOf.y+this.x*Math.sin(this.PartOf.angle)-this.y*Math.cos(this.PartOf.angle);
				ctx1.translate(X,Y);
				ctx1.rotate(this.angle+this.PartOf.angle);
				ctx1.scale(this.scale*this.PartOf.scale,this.scale*this.PartOf.scale);
				ctx1.translate(-this.sprite.naturalWidth/2,-this.sprite.naturalHeight/2);				
				ctx1.drawImage(this.sprite,0,0);						
				ctx1.restore();
				
				for (var i=0;i<this.Damages.length;i++){
					var tmpx = this.x;
					var tmpy = this.y;
					var tmpa = this.angle;
					this.x = X;
					this.y = Y;
					this.angle = this.PartOf.angle+this.angle;
					this.Damages[i].Draw();
					this.x = tmpx;
					this.y = tmpy;
					this.angle = tmpa;
				}	
			}
		}else{
			if(this.live > 0){
				ctx1.save();	
				ctx1.globalAlpha = this.live/this.maxLive;
				ctx1.translate(this.x,this.y);
				ctx1.rotate(this.angle);
				ctx1.scale(this.scale*this.PartOf.scale,this.scale*this.PartOf.scale);
				ctx1.translate(-this.sprite.naturalWidth/2,-this.sprite.naturalHeight/2);				
				ctx1.drawImage(this.sprite,0,0);						
				ctx1.restore();

				for (var i=0;i<this.Damages.length;i++){
					this.Damages[i].Draw();
				}						
				//Obliczenie nowej pozycji
				CalculatePos(dTime,this);
				this.live -= dTime;
			}
		}
	}
}		

function Damage(sprite,PartOf,x,y,angle,scale,mass,live,maxLive,flame){			
	this.sprite = sprite;
	this.PartOf = PartOf;
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.scale = scale;
	this. mass = mass;
	this.live = live;			
	if (maxLive === undefined){this.maxLive = this.live;}else{this.maxLive = maxLive;}			
	this.flame = flame;
	this.dScale = 0.000;
	
	this.Draw = function(){
		if (this.live > 0){
			ctx1.save();	
			ctx1.globalAlpha = this.live/this.maxLive;
			var X = this.PartOf.x+this.x*Math.cos(this.PartOf.angle)+this.y*Math.sin(this.PartOf.angle);
			var Y = this.PartOf.y+this.x*Math.sin(this.PartOf.angle)-this.y*Math.cos(this.PartOf.angle);
			ctx1.translate(X,Y);
			ctx1.rotate(this.angle+this.PartOf.angle);
			ctx1.scale(this.scale*this.PartOf.scale,this.scale*this.PartOf.scale);
			ctx1.translate(-this.sprite.naturalWidth/2,-this.sprite.naturalHeight/2);				
			ctx1.drawImage(this.sprite,0,0);						
			ctx1.restore();
			
			//Dym i iskry
			if (this.flame){
				var V1 = 50;
				if(Math.random() > 0.5){
					var F = new Smoke(spark1,X,Y,(Math.random()-0.5)*V1,(Math.random()-0.5)*V1,0,0,0,(Math.random()-0.5)*3,0,this.scale*this.PartOf.scale*0.2,Math.random()*300);
					F.dScale = 0.001;
				}
				var V = 20;
				var Live = 1000;
				if(Math.random() > 0.5){var S1 = new Smoke(smoke4,X,Y,(Math.random()-0.5)*V,(Math.random()-0.5)*V,(Math.random()-0.5)*3,Math.random()*1,0,0,0,this.scale*this.PartOf.scale*0.4,Live,Live);}	
			}	
		}
	}
}	



function Item(sprite,text,path,x,y,vx,vy,Fx,Fy,angle,rot,mass,live,maxLive){
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	
}



serialize=function(OBJECTS){
	var DATA = "";
	for(var i=0;i<OBJECTS.length;i++){
		if(i!=0){DATA+="|";}
		str="x="+OBJECTS[i].x+";";
		DATA+=str;
		str="y="+OBJECTS[i].y+";";
		DATA+=str;
		str="vx="+OBJECTS[i].vx+";";
		DATA+=str;
		str="vy="+OBJECTS[i].vy+";";
		DATA+=str;
		str="Fx="+OBJECTS[i].Fx+";";
		DATA+=str;
		str="Fy="+OBJECTS[i].Fy+";";
		DATA+=str;
		str="angle="+OBJECTS[i].angle+";";
		DATA+=str;
		str="rot="+OBJECTS[i].rot+";";
		DATA+=str;
		str="mass="+OBJECTS[i].mass+";";
		DATA+=str;
		str="fuel="+OBJECTS[i].fuel+";";
		DATA+=str;
		str="live="+OBJECTS[i].live+";";
		DATA+=str;
		str="destroyed="+OBJECTS[i].Destroyed;				
		DATA+=str;
	}
	return DATA;
}

unserialize=function(DATA){
	
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

function Weapon_Frag_Launcher(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,owner,dmg,bounce,penetration){
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	this.BaseDmg = dmg;
	this.DmgRadius = 0;
	this.MissileFuel = 0;
	this.MissileVMax = 600*owner.scale;
	this.Bounce = bounce;
	this.Penetration = penetration;	
	
	this.Guidance = 3;
	this.IsGuided = false;
	
	this.WeaponOwner = owner;
	this.HitForce = 0;
	
	this.Name = 'Frag1';
	this.BlastSound = Default;
}


function Weapon_CPR7_Missile_Launcher(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,owner){
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	this.BaseDmg = 20;
	this.Frags = 50;
	this.Frag = new Weapon_Frag_Launcher(missile1,0,0,0,0,0,0,0,0,0,owner.scale,100,100,owner,5,0,0.3);
	this.DmgRadius = 60*owner.scale;
	this.BlastSpeed = 300*owner.scale;
	this.MissileFuel = 2000*owner.scale;
	this.RestoreTime = 200;
	this.MissileVMax = 900*owner.scale;
	
	this.Guidance = 5;
	this.IsGuided = true;
	this.WeaponSide = true;
	this.WeaponOwner = owner;
	this.ExplosionParticles = 10;			
	this.HitForce = 10;
	
	this.AIUsageRate = 0.01;
	
	this.Name = 'CPR7 Missile Launcher';
	this.FireSound = MissileStart3;
	this.BlastSound = Explosion1;
	
	this.Fire = function(Target){
		if (this.WeaponOwner.GunTimer > this.RestoreTime){									
			var launch = true;
			var x1 = -20*this.WeaponOwner.scale;	
			if (this.WeaponSide){
				var y1 = 30*this.WeaponOwner.scale;
				this.WeaponSide=false;
				if (this.WeaponOwner.Parts[6].live < 0){launch = false;}
			}else{
				var y1 = -30*this.WeaponOwner.scale;
				this.WeaponSide=true;
				if (this.WeaponOwner.Parts[23].live < 0){launch = false;}
			}					
			var X = this.WeaponOwner.x+x1*Math.cos(this.WeaponOwner.angle)+y1*Math.sin(this.WeaponOwner.angle);
			var Y = this.WeaponOwner.y+x1*Math.sin(this.WeaponOwner.angle)-y1*Math.cos(this.WeaponOwner.angle);					
			var V = 1000*this.WeaponOwner.scale;
			var F = 100000*this.WeaponOwner.scale;
			var vx = V*Math.cos(this.WeaponOwner.angle)+this.WeaponOwner.vx;
			var vy = V*Math.sin(this.WeaponOwner.angle)+this.WeaponOwner.vy;
			var Fx = F*Math.cos(this.WeaponOwner.angle);
			var Fy = F*Math.sin(this.WeaponOwner.angle);
			if (launch){
				//Play sound
				this.FireSound.Play(this.WeaponOwner.x,this.WeaponOwner.y);
				var M = new MissileRocket(missile1,X,Y,vx,vy,Fx,Fy,this.WeaponOwner.angle,0,25,this.scale,100,100,this);
				M.vMax = this.MissileVMax;
				M.Target = Target;
			}
			this.WeaponOwner.GunTimer = 0;
		}
	}
}		

function Weapon_CPR9_Missile_Launcher(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,owner){
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	this.BaseDmg = 50;
	this.Frags = 4;
	this.Frag = new Weapon_CPR7_Missile_Launcher(missile1,0,0,0,0,0,0,0,0,0,1,100,100,owner);
	this.DmgRadius = 100*owner.scale;
	this.BlastSpeed = 800*owner.scale;
	this.MissileFuel = 2000*owner.scale;
	this.RestoreTime = 100;
	this.MissileVMax = 1200*owner.scale;
	
	this.Guidance = 3;
	this.IsGuided = true;
	this.WeaponSide = true;
	this.WeaponOwner = owner;
	this.ExplosionParticles = 3;
	this.HitForce = 10;
	
	this.AIUsageRate = 0.01;
	
	this.Name = 'CPR9 Missile Launcher';
	this.FireSound = MissileStart2;
	this.BlastSound = MissileStart3;
	
	this.Fire = function(Target){
		if (this.WeaponOwner.GunTimer > this.RestoreTime){									
			var launch = true;
			var x1 = -20*this.WeaponOwner.scale;	
			if (this.WeaponSide){
				var y1 = 30*this.WeaponOwner.scale;
				this.WeaponSide=false;
				if (this.WeaponOwner.Parts[6].live < 0){launch = false;}
			}else{
				var y1 = -30*this.WeaponOwner.scale;
				this.WeaponSide=true;
				if (this.WeaponOwner.Parts[23].live < 0){launch = false;}
			}					
			var X = this.WeaponOwner.x+x1*Math.cos(this.WeaponOwner.angle)+y1*Math.sin(this.WeaponOwner.angle);
			var Y = this.WeaponOwner.y+x1*Math.sin(this.WeaponOwner.angle)-y1*Math.cos(this.WeaponOwner.angle);					
			var V = 1000*this.WeaponOwner.scale;
			var F = 100000*this.WeaponOwner.scale;
			var vx = V*Math.cos(this.WeaponOwner.angle);//+this.WeaponOwner.vx;
			var vy = V*Math.sin(this.WeaponOwner.angle);//+this.WeaponOwner.vy;
			var Fx = F*Math.cos(this.WeaponOwner.angle);
			var Fy = F*Math.sin(this.WeaponOwner.angle);
			if (launch){
				//Play sound
				this.FireSound.Play(this.WeaponOwner.x,this.WeaponOwner.y);				
				var M = new MissilePackedRocket(missile1,X,Y,vx,vy,Fx,Fy,this.WeaponOwner.angle,0,25,this.scale,100,100,this);
				M.vMax = this.MissileVMax;
				M.Target = Target
				M.live = 1;
			}
			this.WeaponOwner.GunTimer = 0;
		}
	}
}			

function Weapon_P7_Missile_Launcher(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,owner){
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	this.BaseDmg = 50;
	this.Frags = 100;
	this.Frag = new Weapon_Frag_Launcher(missile1,0,0,0,0,0,0,0,0,0,owner.scale,100,100,owner,15,0.1,0.6);
	this.DmgRadius = 150*owner.scale;
	this.BlastSpeed = 900*owner.scale;
	this.MissileFuel = 2000*owner.scale;
	this.RestoreTime = 10;
	this.MissileVMax = 1200*owner.scale;
	
	this.Guidance = 0.5;
	this.IsGuided = false;
	this.WeaponSide = true;
	this.WeaponOwner = owner;
	this.ExplosionParticles = 3;
	this.HitForce = 10;
	
	this.AIUsageRate = 0.04;
	
	this.Name = 'Needle Missile Launcher';
	this.FireSound = MissileStart3;
	this.BlastSound = Explosion2;
	
	this.Fire = function(Target){
		if (this.WeaponOwner.GunTimer > this.RestoreTime){									
			var launch = true;
			var x1 = -20*this.WeaponOwner.scale;	
			if (this.WeaponSide){
				var y1 = 30*this.WeaponOwner.scale;
				this.WeaponSide=false;
				if (this.WeaponOwner.Parts[6].live < 0){launch = false;}
			}else{
				var y1 = -30*this.WeaponOwner.scale;
				this.WeaponSide=true;
				if (this.WeaponOwner.Parts[23].live < 0){launch = false;}
			}					
			var X = this.WeaponOwner.x+x1*Math.cos(this.WeaponOwner.angle)+y1*Math.sin(this.WeaponOwner.angle);
			var Y = this.WeaponOwner.y+x1*Math.sin(this.WeaponOwner.angle)-y1*Math.cos(this.WeaponOwner.angle);					
			var V = 1000*this.WeaponOwner.scale;
			var F = 100000*this.WeaponOwner.scale;
			var vx = V*Math.cos(this.WeaponOwner.angle)+this.WeaponOwner.vx;
			var vy = V*Math.sin(this.WeaponOwner.angle)+this.WeaponOwner.vy;
			var Fx = F*Math.cos(this.WeaponOwner.angle);
			var Fy = F*Math.sin(this.WeaponOwner.angle);
			if (launch){
				//Play sound
				this.FireSound.Play(this.WeaponOwner.x,this.WeaponOwner.y);				
				var M = new MissileRocket(missile1,X,Y,vx,vy,Fx,Fy,this.WeaponOwner.angle,0,25,this.scale,100,100,this);
				M.vMax = this.MissileVMax;
				M.Target = Target;
			}
			this.WeaponOwner.GunTimer = 0;
		}
	}
}		

function Weapon_Wulcan_R600(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,owner){
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	this.BaseDmg = 25;
	this.DmgRadius = 0;
	this.MissileFuel = 600*owner.scale;
	this.RestoreTime = 50;
	this.MissileVMax = 1200*owner.scale;
	this.Bounce = 0.5;
	this.Penetration = 0.20;
	this.Spread = 0.1;			
	
	this.Guidance = 3;
	this.IsGuided = false;
	
	this.WeaponSide = true;
	this.WeaponOwner = owner;
	this.ExplosionParticles = 0;
	this.HitForce = 2;
	
	this.AIUsageRate = 0.1;
	this.AISpread = 0.5;
	
	this.Name = 'Gatlling Gun HOT-SHOT';
	this.FireSound = GunFire5;
	this.BlastSound = Ricochet1;
	
	this.Fire = function(Target){
		if (this.WeaponOwner.GunTimer > this.RestoreTime){
			var launch = true;
			var x1 = 10*Math.random()*this.WeaponOwner.scale;	
			var y1 = 0;			
			var X = this.WeaponOwner.x+x1*Math.cos(this.WeaponOwner.angle)+y1*Math.sin(this.WeaponOwner.angle);
			var Y = this.WeaponOwner.y+x1*Math.sin(this.WeaponOwner.angle)-y1*Math.cos(this.WeaponOwner.angle);					
			var V = 2000*this.WeaponOwner.scale;
			var F = 2000*this.WeaponOwner.scale;
			if(this.WeaponOwner.AI_Active){var Spread = this.AISpread;}else{var Spread = this.Spread;}
			var MissileAngle = this.WeaponOwner.angle+Spread*(Math.random()-0.5);
			var vx = V*Math.cos(MissileAngle)+this.WeaponOwner.vx;
			var vy = V*Math.sin(MissileAngle)+this.WeaponOwner.vy;
			var Fx = F*Math.cos(MissileAngle);
			var Fy = F*Math.sin(MissileAngle);
			if (launch){						
				for (var i=0;i<1;i++){
					//paly sound
					this.FireSound.Play(this.WeaponOwner.x,this.WeaponOwner.y);
					
					var M = new MissileLaser(missile1,X,Y,vx,vy,Fx,Fy,this.WeaponOwner.angle,0,25,this.scale*0.25,1,1,this);
					M.vMax = this.MissileVMax;
					M.Target = Target;
				}
			}
			this.WeaponOwner.GunTimer = 0;
		}
	}
}		

function Weapon_Gauss_MG47(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,owner){
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	this.BaseDmg = 180;
	this.DmgRadius = 0;
	this.MissileFuel = 1000*owner.scale;
	this.RestoreTime = 550;
	this.MissileVMax = 1200*owner.scale;
	this.Bounce = 0.01;
	this.Penetration = 1.00;
	this.Spread = 0;			
	
	this.Guidance = 1;
	this.IsGuided = false;
	this.WeaponSide = true;
	this.WeaponOwner = owner;
	this.ExplosionParticles = 0;
	this.HitForce = 10;
	
	this.AIUsageRate = 0.2;
	this.AISpread = 0.0;
	
	this.Name = 'Gauss MG47';
	this.FireSound = GunFire2;
	this.BlastSound = Electricity1;
	
	this.Fire = function(Target){
		if (this.WeaponOwner.GunTimer > this.RestoreTime){									
			var launch = true;
			var x1 = 10*Math.random()*this.WeaponOwner.scale;	
			var y1 = 0;			
			var X = this.WeaponOwner.x+x1*Math.cos(this.WeaponOwner.angle)+y1*Math.sin(this.WeaponOwner.angle);
			var Y = this.WeaponOwner.y+x1*Math.sin(this.WeaponOwner.angle)-y1*Math.cos(this.WeaponOwner.angle);					
			var V = 2000*this.WeaponOwner.scale;
			var F = 2000*this.WeaponOwner.scale;
			if(this.WeaponOwner.AI_Active){var Spread = this.AISpread;}else{var Spread = this.Spread;}
			var MissileAngle = this.WeaponOwner.angle+Spread*(Math.random()-0.5);
			var vx = V*Math.cos(MissileAngle)+this.WeaponOwner.vx;
			var vy = V*Math.sin(MissileAngle)+this.WeaponOwner.vy;
			var Fx = F*Math.cos(MissileAngle);
			var Fy = F*Math.sin(MissileAngle);
			if (launch){
				//Play sound
				this.FireSound.Play(this.WeaponOwner.x,this.WeaponOwner.y);						
				for (var i=0;i<1;i++){
					var M = new MissileLaser(missile2,X,Y,vx,vy,Fx,Fy,this.WeaponOwner.angle,0,25,this.scale*1,100,100,this);
					M.vMax = this.MissileVMax;
					M.Target = Target;
				}
			}
			this.WeaponOwner.GunTimer = 0;
		}
	}
}		

function Weapon_Lasers_LS3000(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,owner){
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	this.BaseDmg = 10;
	this.DmgRadius = 0;
	this.MissileFuel = 2800*owner.scale;
	this.RestoreTime = 80;
	this.MissileVMax = 1800*owner.scale;
	this.Bounce = 0.90;
	this.Penetration = 0.10;
	this.Spread = 0.05;			
	
	this.Guidance = 1;
	this.Speread = 0;
	this.IsGuided = false;
	this.WeaponSide = true;
	this.WeaponOwner = owner;
	this.ExplosionParticles = 0;
	this.HitForce = 0;
	
	this.AIUsageRate = 0.5;
	this.AISpread = 0.2;
	
	this.Name = 'Laser L3000';
	this.FireSound = LaserFire1;
	this.BlastSound = Electricity2;
	
	this.Fire = function(Target){
		if (this.WeaponOwner.GunTimer > this.RestoreTime){									
			var launch = true;
			var x1 = 10*Math.random()*this.WeaponOwner.scale;	
			var y1 = 0;			
			var X = this.WeaponOwner.x+x1*Math.cos(this.WeaponOwner.angle)+y1*Math.sin(this.WeaponOwner.angle);
			var Y = this.WeaponOwner.y+x1*Math.sin(this.WeaponOwner.angle)-y1*Math.cos(this.WeaponOwner.angle);					
			var V = 2000*this.WeaponOwner.scale;
			var F = 2000*this.WeaponOwner.scale;
			if(this.WeaponOwner.AI_Active){var Spread = this.AISpread;}else{var Spread = this.Spread;}
			var MissileAngle = this.WeaponOwner.angle+Spread*(Math.random()-0.5);
			var vx = V*Math.cos(MissileAngle)+this.WeaponOwner.vx;
			var vy = V*Math.sin(MissileAngle)+this.WeaponOwner.vy;
			var Fx = F*Math.cos(MissileAngle);
			var Fy = F*Math.sin(MissileAngle);
			if (launch){
				//Play sound
				this.FireSound.Play(this.WeaponOwner.x,this.WeaponOwner.y);					
				for (var i=0;i<1;i++){
					var M = new MissileLaser(missile5,X,Y,vx,vy,Fx,Fy,MissileAngle,0,25,this.scale*0.5,100,100,this);
					M.vMax = this.MissileVMax;
					M.Target = Target;
				}
			}
			this.WeaponOwner.GunTimer = 0;
		}
	}
}

function Weapon_PlasmaGun_PY200(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,owner){
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	this.BaseDmg = 100;
	this.DmgRadius = 0;
	this.MissileFuel = 400*owner.scale;
	this.RestoreTime = 200;
	this.MissileVMax = 1200*owner.scale;
	this.Bounce = 0.10;
	this.Penetration = 0.60;
	this.Spread = 0.3;
	
	this.Guidance = 1;
	this.IsGuided = false;
	this.WeaponSide = true;
	this.WeaponOwner = owner;
	this.ExplosionParticles = 0;
	this.HitForce = 0;
	
	this.AIUsageRate = 0.2;
	this.AISpread = 0.3;
	
	this.Name = 'PlasmaGun PY200';
	this.FireSound = GunFire3;
	this.BlastSound = Electricity1;
	
	this.Fire = function(Target){
		if (this.WeaponOwner.GunTimer > this.RestoreTime){									
			var launch = true;
			var x1 = 10*Math.random()*this.WeaponOwner.scale;	
			var y1 = 0;			
			var X = this.WeaponOwner.x+x1*Math.cos(this.WeaponOwner.angle)+y1*Math.sin(this.WeaponOwner.angle);
			var Y = this.WeaponOwner.y+x1*Math.sin(this.WeaponOwner.angle)-y1*Math.cos(this.WeaponOwner.angle);					
			var V = 2000*this.WeaponOwner.scale;
			var F = 2000*this.WeaponOwner.scale;
			if(this.WeaponOwner.AI_Active){var Spread = this.AISpread;}else{var Spread = this.Spread;}
			var MissileAngle = this.WeaponOwner.angle+Spread*(Math.random()-0.5);
			var vx = V*Math.cos(MissileAngle)+this.WeaponOwner.vx;
			var vy = V*Math.sin(MissileAngle)+this.WeaponOwner.vy;
			var Fx = F*Math.cos(MissileAngle);
			var Fy = F*Math.sin(MissileAngle);
			if (launch){
				//Play sound
				this.FireSound.Play(this.WeaponOwner.x,this.WeaponOwner.y);						
				for (var i=0;i<1;i++){
					var M = new MissileLaser(missile3,X,Y,vx,vy,Fx,Fy,MissileAngle,0,25,this.scale*1,100,100,this);
					M.vMax = this.MissileVMax;
					M.Target = Target;
				}
			}
			this.WeaponOwner.GunTimer = 0;
		}
	}
}		

function Weapon_Nuke_Launcher(sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive,owner){
	Particle.call(this,sprite,x,y,vx,vy,Fx,Fy,angle,rot,mass,scale,live,maxLive);
	this.BaseDmg = 100;
	this.Frags = 250;
	this.Frag = new Weapon_Frag_Launcher(missile1,0,0,0,0,0,0,0,0,0,owner.scale,100,100,owner,20,0,1);
	this.DmgRadius = 450*owner.scale;
	this.BlastSpeed = 350*owner.scale;
	this.MissileFuel = 1750*owner.scale;
	this.RestoreTime = 1500;
	this.MissileVMax = 900*owner.scale;
	
	this.Guidance = 0;
	this.IsGuided = false;
	this.WeaponSide = true;
	this.WeaponOwner = owner;
	this.ExplosionParticles = 30;			
	this.HitForce = 20;
	
	this.AIUsageRate = 0.01;
	
	this.Name = 'Nuke Launcher';
	this.FireSound = MissileStart2;
	this.BlastSound = Explosion3;
	
	this.Fire = function(Target){
		if (this.WeaponOwner.GunTimer > this.RestoreTime){									
			var launch = true;
			var x1 = -20*this.WeaponOwner.scale;	
			if (this.WeaponSide){
				var y1 = 30*this.WeaponOwner.scale;
				this.WeaponSide=false;
				if (this.WeaponOwner.Parts[6].live < 0){launch = false;}
			}else{
				var y1 = -30*this.WeaponOwner.scale;
				this.WeaponSide=true;
				if (this.WeaponOwner.Parts[23].live < 0){launch = false;}
			}					
			var X = this.WeaponOwner.x+x1*Math.cos(this.WeaponOwner.angle)+y1*Math.sin(this.WeaponOwner.angle);
			var Y = this.WeaponOwner.y+x1*Math.sin(this.WeaponOwner.angle)-y1*Math.cos(this.WeaponOwner.angle);					
			var V = 1000*this.WeaponOwner.scale;
			var F = 100000*this.WeaponOwner.scale;
			var vx = V*Math.cos(this.WeaponOwner.angle)+this.WeaponOwner.vx;
			var vy = V*Math.sin(this.WeaponOwner.angle)+this.WeaponOwner.vy;
			var Fx = F*Math.cos(this.WeaponOwner.angle);
			var Fy = F*Math.sin(this.WeaponOwner.angle);
			if (launch){
				//Play sound
				this.FireSound.Play(this.WeaponOwner.x,this.WeaponOwner.y);
				var M = new MissileRocket(missile1,X,Y,vx,vy,Fx,Fy,this.WeaponOwner.angle,0,25,this.scale*1.2,1,1,this);
				M.vMax = this.MissileVMax;
				M.Target = Target;
			}
			this.WeaponOwner.GunTimer = 0;
		}
	}
}
	

//////////////////////////////////////////////////////////////////////////////////////////////////////
//DZWIĘKI

function Sound(src) {
	this.SoundTable = [];
	this.Source = src;
	this.Volume = GlobalVolume;			
	
	this.AddSound = function(){
		var i = this.SoundTable.length;
		this.SoundTable[i] = document.createElement("audio");
		this.SoundTable[i].src = this.Source;
		this.SoundTable[i].setAttribute("preload", "auto");
		this.SoundTable[i].setAttribute("controls", "none");
		this.SoundTable[i].style.display = "none";
		document.body.appendChild(this.SoundTable[i]);
	}
	
	this.Play = function(x,y){
		var PlayFlag = false;
		var HearRadius = 2800;
		var L = Math.sqrt((SHIP.x-x)*(SHIP.x-x)+(SHIP.y-y)*(SHIP.y-y));
		var Qv = /*(HearRadius/10+1)/(L+1);*/(HearRadius-L)/HearRadius;
		//Add_Cmd_Text('Sound Volume = '+Qv);
		if(Qv<0){Qv=0;}
		if((Qv>0)&&(L<HearRadius)){
			if(Qv>1){Qv=1;}
			for(var i=0;i<this.SoundTable.length;i++){
				if(this.SoundTable[i].ended){
					this.SoundTable[i].volume = this.Volume*Qv;							
					this.SoundTable[i].play();
					PlayFlag = true;
					break;
				}
			}
			if((!PlayFlag)&&(this.SoundTable.length<5)){
				this.AddSound();
				this.SoundTable[this.SoundTable.length-1].volume = this.Volume*Qv;
				this.SoundTable[this.SoundTable.length-1].play();
			}
		}
	}    
}

//////////////////////////////////////////////////////////////////////////////////////////////////////		

//Reset AI ships
function LoadShips(){			
	//Wszsytkie statki
	//if(AI_Number.value>20){AI_Number.value=20;}
	if(AI_Number.value<1){AI_Number.value=1;}

	for (var i=0;i<AI_Number.value;i++){
		SHIPS[i] = new Ship(ship1,Math.random()*1200,Math.random()*800,00,00,0000,0000,0,0,100,GlobalScale,100,100,true);
		if(AI_Weapon.value == -1){
			SHIPS[i].ActiveWeapon = Math.round(Math.random()*7);					
		}else{
			SHIPS[i].ActiveWeapon = AI_Weapon.value;
		}
		SHIPS[i].vMax = AI_Speed.value*SHIPS[i].scale;
		SHIPS[i].vMaxBase = SHIPS[i].vMax;
		SHIPS[i].AI_Guidance = AI_Guidance.value;				
	}		
}

function ReloadShips(Ships){
	var IsPlayerAlive = false;
	SHIPS = [];
	//Particles = [];
	//Ind1 = 0;
	for(var i=0;i<Ships.length;i++){
		if(!Ships[i].Destroyed){
			SHIPS[SHIPS.length] = Ships[i];
			if(!Ships[i].AI_Active){IsPlayerAlive = true;}
		}
	}
	//Jesli Palyer zginął załaduj go  ponownie
	if(!IsPlayerAlive){
		LoadPlayer()
	}else{
		LoadShips();
		SHIPS[SHIPS.length] = SHIP;
	}
}

//Przeładuj wszystkie statki
function StartGame(){
	SHIPS = [];
	Particles = [];
	Ind1 = 0;
	LoadShips();
	LoadPlayer()						
}

//Załaduj Playera
function LoadPlayer(){
	SHIP = new Ship(ship1,ctx.canvas.clientWidth/2,ctx.canvas.clientHeight/2,0,0,0,0,0,0,100,GlobalScale,100,100,false);
	SHIPS[SHIPS.length] = SHIP;
	SHIP.vMaxBase = 1400*SHIP.scale;
	SHIP.vMax = 1400*SHIP.scale;						
}

//Interwał rysujący	
StartGame()
var FrameTime = 25;//Limit czasu ramki		
DrawInterval = setInterval(Redraw,FrameTime);
		
//////////////////////////////////////////////////////////////////////////////////////////////////////

function Cursor_view(x,y){	//Widok kursora w polu graficznym			
	ctx1.beginPath();
	ctx1.strokeStyle="#FF0000";
	ctx1.lineWidth=3;
	ctx1.arc(x,y,5,0,2*Math.PI);
	ctx1.stroke();
}		

function Redraw(){//Przerysowanie obiektów na Canvie			
	StartTime = new Date();				
	DrawCount++;
	//czyszczenie canvy wirtualnej
	ctx1.fillStyle = '#000000';
	ctx1.fillRect(0,0,ctx.canvas.clientWidth,ctx.canvas.clientHeight);
	
	//Wybór celu aktywnego dla AI
	for(var i=0;i<SHIPS.length;i++){					
		for(var j=0;j<SHIPS.length;j++){
			if((!SHIPS[j].Destroyed)&&(SHIPS[j]!==SHIPS[i])&&(!SHIPS[j].Destroyed)){
				SHIPS[i].Target = SHIPS[j];
				break;
			}
			
		}	
		if(!AI_TotalWar.checked){if((SHIPS[i]!==SHIP)){SHIPS[i].Target = SHIP;}else{SHIPS[i].Target = SHIPS[j];}}
		//SHIPS[i].Target = SHIP;
	}
	
	//Funkcje myszki
	if(Turn_on_player_input.checked){
		if (MBPressed.Left){
			SHIP.UseWeapon();
		}	
		if (MBPressed.Right){
			
		}
	}

	//Funkcje klawiatury
	if(Turn_on_player_input.checked){
		if ((KeyPressed == 'w')){
			if ((SHIP.Parts[14].live > 0)||(SHIP.Parts[31].live > 0)){
				var E1 = SHIP.Parts[14].live;
				var E2 = SHIP.Parts[31].live;
				if (E1 < 0){E1 = 0;}
				if (E2 < 0){E2 = 0;}
				if(KeyPressed == 'w'){
					var F = 100000;
				}
				F *= (E1+E2)/(SHIP.Parts[14].maxLive+SHIP.Parts[31].maxLive);
				SHIP.vMax = SHIP.vMaxBase * (E1+E2)/(SHIP.Parts[14].maxLive+SHIP.Parts[31].maxLive);
				SHIP.Fx = Math.cos(SHIP.angle)*F;
				SHIP.Fy = Math.sin(SHIP.angle)*F;
			}
		}else{
			SHIP.Fx = 0;
			SHIP.Fy = 0;
		}
		if ((KeyPressed == 's')){
			SHIP.vx *= 0.92;
			SHIP.vy *= 0.92;
		}
	}
	
	//Rysowanie cząstek
	for (var i = 0; i < Particles.length; i++){
		if(Particles[i]!== undefined){Particles[i].Draw(dt);}
	}

	
	//Rysowanie statków AI
	if(SHIPS.length > 0){
		var ShipsCount = 0;
		for (var i=0;i<SHIPS.length;i++){
			if(!SHIPS[i].Destroyed){
				ShipsCount++;					
				if (SHIPS[i].HullLive() > SHIPS[i].AgonyLive){						
					if(SHIPS[i].AI_Active){SHIPS[i].AIcontrol(dt,SHIPS[i].Target);}
					SHIPS[i].GunTimer += dt;
				}else{
					SHIPS[i].ShipExplosion();				
				}
			}
		}
		if((ShipsCount < 2)||(SHIP.Destroyed)){				
			GlobalGameTimer += dt;
			if(GlobalGameTimer>2000){
				ReloadShips(SHIPS);
				GlobalGameTimer = 0;
			}
		}
	}
	for (var i = 0; i < Smokes.length; i++){
		Smokes[i].Draw(dt)
	}			
	
	//Pokaz ile życia zostało AI
	if(SHIPS.length > 0){
		for (var i=0;i<SHIPS.length;i++){
			SHIPS[i].Draw(dt);
			ctx1.font = "bold 15px Arial";
			ctx1.fillStyle = "green";
			ctx1.textAlign = "center";			
			if(AI_Live.checked){ctx1.fillText(Math.round(SHIPS[i].HullLive()),SHIPS[i].x+50,SHIPS[i].y);}
			ctx1.font = "10px Arial";
			if(AI_Live.checked){ctx1.fillText(SHIPS[i].Weapons[SHIPS[i].ActiveWeapon].Name,SHIPS[i].x+50,SHIPS[i].y+10);}
		}
	}
	
	//PLAYER HUD
	ctx1.font = "15px Arial";
	ctx1.fillStyle = "red";
	ctx1.textAlign = "left";			
	ctx1.fillText(SHIP.Weapons[SHIP.ActiveWeapon].Name,10,20);
	ctx1.fillText('Ships = '+ShipsCount+' HullLive = '+Math.round(SHIP.HullLive())+' Particles = '+Ind1+'/'+Particles.length,10,35);
	ctx1.fillText('Ships V = '+Math.round(SHIP.V())+" Ship Fuel = "+Math.round(SHIP.Fuel),10,50);
	ctx1.fillText('FPS '+Math.round(1000/dt),10,65);
	ctx1.fillText(Version,10,80);
	
	Cursor_view(Mouse.x,Mouse.y);
	//Obróć statek playera na kursor
	if(Turn_on_player_input.checked){
		var L = Math.sqrt((SHIP.x - Mouse.x)*(SHIP.x - Mouse.x) + (SHIP.y - Mouse.y)*(SHIP.y - Mouse.y));
		var sin = (Mouse.y - SHIP.y)/L;
		var cos = (Mouse.x - SHIP.x)/L;
		SHIP.angle = Math.atan2(sin,cos);
		var F = Math.sqrt(SHIP.Fx*SHIP.Fx+SHIP.Fy*SHIP.Fy);
		SHIP.Fx = F*Math.cos(SHIP.angle);
		SHIP.Fy = F*Math.sin(SHIP.angle);
	}
	
	//Przerysowanie na canve ekranu
	ctx.drawImage(c1,0,0);
	StopTime = new Date();
	//Czas generowania ramki
	dt = 1000*(StopTime.getSeconds()-StartTime.getSeconds())+(StopTime.getMilliseconds()-StartTime.getMilliseconds());
	if (dt < FrameTime){dt = FrameTime;}			
}

Canva.onmousemove = function CurPos(event){
	Mouse.x = event.clientX+window.pageXOffset-TableCanva.offsetLeft-TdCanva.offsetLeft;
	Mouse.y = event.clientY+window.pageYOffset-TableCanva.offsetTop-TdCanva.offsetTop;	
	
	if (MBPressed.Right){
	
	}
	if (MBPressed.Left){
	
	}
	LastClickMouse.x = Mouse.x;
	LastClickMouse.y = Mouse.y;
	//Redraw();			
}

Canva.onmousedown = function(event){
	if (event.button == 0){//wciśnięcie lewego klawisza myszy
		MBPressed.Left = true;
		Add_Cmd_Text("you pressed LMB");							
	}
	if (event.button == 1){//wciśnięcie scrolla
		MBPressed.Middle = true;
		Add_Cmd_Text("you pressed MMB");
	}
	if (event.button == 2){//wciśnięcie prawego klawisza myszy
		MBPressed.Right = true;
		Add_Cmd_Text("you pressed RMB");
	}			
}

Canva.onmouseup = function(event){
	if (event.button == 0){
		MBPressed.Left = false
		Add_Cmd_Text("you released LMB");
	}
	if (event.button == 1){
		MBPressed.Middle = false;
		Add_Cmd_Text("you released MMB");
	}
	if (event.button == 2){
		MBPressed.Right = false;
		Add_Cmd_Text("you released RMB");
	}	
}

function displaywheel(event){ 
	if ((event.wheelDelta < 0) && (Scale > 0.000001)){//Scroll w górę
		Add_Cmd_Text("you scrolled up");
		SHIP.ActiveWeapon += 1;
		if (SHIP.ActiveWeapon > SHIP.Weapons.length-1){SHIP.ActiveWeapon = 0;}
	} 
	if (event.wheelDelta > 0){//Scroll w dół
		Add_Cmd_Text("you scrolled down");
		SHIP.ActiveWeapon -= 1;
		if (SHIP.ActiveWeapon < 0){SHIP.ActiveWeapon = SHIP.Weapons.length-1;}
	}			
} 
Canva.addEventListener("mousewheel", displaywheel, false)

//Dodawanie tekstu do Command Line
function Add_Cmd_Text(text){
	//TextOut.innerHTML = "["+Command_Line_Count+"] > " + text + "<br/>" + TextOut.innerHTML;
	Command_Line_Count ++;
}

//Obsługa klawiatury
TdCanva.onkeydown = function(event){	
	Add_Cmd_Text("you pressed: '"+event.key+"' key");
	KeyPressed = event.key;
}

TdCanva.onkeyup = function(event){	
	Add_Cmd_Text("you release: '"+event.key+"' key");
	KeyPressed = '';
}		

//Przycisk RESET
AI_Reset.addEventListener("click",StartGame);
