var ObstacleFlag = false;

/* スタートボタンクリック処理 */
function btnStartOnClick(){

    //ボタン色変更
    let btnStart = document.getElementsByClassName('start'); 
    btnStart[0].style.backgroundColor = 'yellow';

    let obstacleNote = document.getElementById('obstacleNote');
    obstacleNote.innerHTML = '<p><font color="red">【ステップ２】右の９×９の好きなマスを左クリックして障害物を好きなだけ配置してください。</font></p>'

    ObstacleFlag = true;
}

/* 終了ボタンクリック処理 */
function btnEndOnClick(){

    //スタートボタンの処理
    btnStart = document.getElementsByClassName('start'); //elementsで複数形だから配列になる
    btnStart[0].style.backgroundColor = '#ffffff';

    //経路探索開始ボタンの処理
    let btnKeiro = document.getElementsByClassName('keiro'); 
    btnKeiro[0].style.backgroundColor = '#ffffff';

    //ボタン色変更
    let btns = document.getElementsByClassName('math');
    for (let i = 0; i < btns.length; i++){
        btns[i].style.backgroundColor = '#ffffff';
        btns[i].style.color = 'black';
        btns[i].value = "";
    }

    //スタートとゴールの処理
    let btn1 = document.getElementById('1');
    btn1.value = "S";
    btn1.style.backgroundColor = 'blue';
    let btn2 = document.getElementById('81');
    btn2.value = "G";
    btn2.style.backgroundColor = 'red';

    let obstacleNote = document.getElementById('obstacleNote');
    obstacleNote.innerHTML = '<p><font color="red">【ステップ１】スタートを押してゲームを開始してください。</font></p>'

    //グローバル変数の初期化
    ObstacleFlag = false;
}

/* 数字のボタンのクリック処理*/ 
function btnNumOnClick(btnNo){
    // 数字のボタンクリック時の処理を記載すること
    if (!(btnNo == 1 || btnNo == 81)){
        if (ObstacleFlag){
            let btn = document.getElementById(String(btnNo));
            if (!(btn.value === "△")){
                btn.value = "△";
                btn.style.backgroundColor = 'yellow';
            }else{
                btn.value = "";
                btn.style.backgroundColor = '#ffffff';
            }
        }
    }
}

/* 経路探索開始ボタンクリック処理 */
let QLearning = {
    //エージェントのスタート位置
    sPosX : 1,
    sPosY : 1,
    sdPosX : 1,
    sdPosY : 1,

    //エージェントの進行方向
    LEFT  : 0,
	UP    : 1,
	RIGHT : 2,
	DOWN  : 3,

    EPSILON : 0.30,       // ε-greedy法のε
    ALPHA : 0.10,         // 学習率α
    GAMMA : 0.90,         // 割引率γ
    GOAL_REWARD : 100,    // ゴール時の報酬
    HIT_WALL_PENALTY : 5, // 壁にぶつかった時の報酬のペナルティ
    ONE_STEP_PENALTY : 1, // 1ステップ経過のペナルティ
    LEANING_TIMES : 1000, // 学習回数
    INIT_Q_MAX : 30,      // Qの初期値の最大値(乱数の最大値)

    MAZE : [[],[],[],[],[],[],[],[],[],[],[]], //経路の定義　壁なら0、進めるなら1

    q : [[[],[],[],[],[],[],[],[],[],[],[]],  //行動価値関数Q
         [[],[],[],[],[],[],[],[],[],[],[]],
         [[],[],[],[],[],[],[],[],[],[],[]],
         [[],[],[],[],[],[],[],[],[],[],[]]],

    maxAction : [[],[],[],[],[],[],[],[],[],[],[]], //最大価値の行動

    maxStateX : [], //最大価値の行動を取った時のX座標
    maxStateY : [], //最大価値の行動を取った時のY座標


    btnKeiroOnClick : function(){
        if(ObstacleFlag){
            let btnStart = document.getElementsByClassName('start'); 
            btnStart[0].style.backgroundColor = '#ffffff';
            let btnKeiro = document.getElementsByClassName('keiro'); 
            btnKeiro[0].style.backgroundColor = 'yellow';
            let btns = document.getElementsByClassName('math');

            let obsFlag = false;

            for (let y = 0; y < 9; y++){
                for (let x = 0; x < 9; x++){
                    if (btns[(y * 9) + x].value == "" || btns[(y * 9) + x].value == "S" || btns[(y * 9) + x].value == "G"){
                        this.MAZE[y+1][x+1] = 1;
                    }else{
                        this.MAZE[y+1][x+1] = 0;
                    }
                }
            }
            for (let y = 0; y < 11; y++){
                for (let x = 0; x < 11; x++){
                    if (y == 0 || y == 10 || x == 0 || x == 10){
                        this.MAZE[y][x] = 0;
                    }
                }
            }

            this.init();
            this.initQ();

            for (let i = 0; i < this.LEANING_TIMES; i++) {
                if(obsFlag){
                    break;
                }
			    this.initAgent();    // エージェントの初期化
                let isGoal = false;
                let count = 0;
                if (i == (this.LEANING_TIMES - 1)){
                    this.EPSILON = 1.0; //100%の確率で最適な行動をとる
                }

			    while (!isGoal) {
                    count++;
                    if (count == 8000){
                        obsFlag = true;
                        break;
                    }
                    let a = this.eGreedy();   // ε-greedy法で行動を選択
                    let r = this.Action(a);   // 行動を行い次の状態を観測し報酬を受け取る
				    r -= this.ONE_STEP_PENALTY;     // ステップ経過のペナルティ
				    this.updateQ(r, a);       // Q値の更新
				    this.updateS();           // 状態の更新 s←s'
                    if(i == (this.LEANING_TIMES - 1)){
                        this.maxStateX.push(this.sPosX);
		                this.maxStateY.push(this.sPosY);
                    }
				    // ゴールの判定
				    if (this.sPosX == 9 && this.sPosY == 9) {
                        isGoal = true;
				    }
                }
            }

            this.showQA(); //最大価値の行動を矢印で定義
            //valueの書き換え
            for (let y = 1; y < 10; y++){
                for(let x = 1; x < 10; x++){
                    if (btns[((y - 1) * 9) + (x - 1)].value == "△" || btns[((y - 1) * 9) + (x - 1)].value == "S" || btns[((y - 1) * 9) + (x - 1)].value == "G"){
                        continue;
                    }else{
                        btns[((y - 1) * 9) + (x - 1)].value = this.maxAction[y][x];
                    }
                }
            }
            //最短距離の道の矢印の色を赤に変更
            for (let i = 0; i < (this.maxStateX.length - 1); i++){
                let x = this.maxStateX[i] - 1;
                let y = this.maxStateY[i] - 1;
                btns[(y * 9) + x].style.color = 'red';
            }

            //ゴールにたどり着けなかった場合（道がふさがれてた場合）
            if (obsFlag){
                let obstacleNote = document.getElementById('obstacleNote');
                obstacleNote.innerHTML = '<p><font color="red">【エラー】障害物で道が塞がれています。もう一度やり直してください。（終了ボタンで戻ります。）</font></p>'
            }else{
                let obstacleNote = document.getElementById('obstacleNote');
                obstacleNote.innerHTML = '<p><font color="red">【ステップ3】最短経路（赤矢印）が導かれました。（終了ボタンで戻ります。）</font></p>'
            }
        }
    },

    //初期化
    init : function() {
        this.EPSILON = 0.3;
        this.maxStateX = [];
        this.maxStateY = [];
    },

    //Q値の初期化
    initQ : function() {
		// 0~INIT_Q_MAXの乱数で初期化
		for (let a = 0; a < 4; a++) {
			for (let y = 0; y < 11; y++) {
				for (let x = 0; x < 11; x++) {
					let randNum = Math.floor(Math.random() * (this.INIT_Q_MAX + 1));
					this.q[a][y][x] = randNum;
				}
			}
		}
    },

    // エージェントの初期化
	initAgent : function() {
		this.sPosX = 1;
        this.sPosY = 1;
	},
    
    // 行動の選択 ε-greedy法
	eGreedy : function() {
		
		let selectedA = 0;
		
        let randNum = Math.floor(Math.random() * (100 + 1));
        
        if (randNum <= this.EPSILON * 100.0) {
        	// εの確率　Q値が最大となるようなaを選択
			for (let a = 0; a < 4; a++) {
				if (this.q[selectedA][this.sPosY][this.sPosX] < this.q[a][this.sPosY][this.sPosX]) {
					selectedA = a;	
				}
			}
        } else {
        	// (1-ε)の確率　ランダムにaを選択
        	selectedA = Math.floor(Math.random() * 4);;
        }
        return selectedA;
    },
    
    // directionの向きに移動可能であれば移動
	// 報酬を返す
	Action : function(direction) {
		
		let r = 0;
		
		// 観測後の状態に現在の状態を設定
		// この関数内で観測後のものに書き換える
		this.sdPosX = this.sPosX;
		this.sdPosY = this.sPosY;
				
		switch (direction) {
			case this.LEFT:
                // 移動可能か
                if (this.MAZE[this.sPosY][this.sPosX - 1] == 1) {
                    this.sdPosX--;
                } else {
                    // 壁にぶつかった時
                    r -= this.HIT_WALL_PENALTY;
                }
                break;
                
			case this.UP:
                // 移動可能か
				if (this.MAZE[this.sPosY - 1][this.sPosX] == 1) {
					this.sdPosY--;
				} else {
					// 壁にぶつかった時
                    r -= this.HIT_WALL_PENALTY;
                }
                break;
                
			case this.RIGHT:
                // 移動可能か
				if (this.MAZE[this.sPosY][this.sPosX + 1] == 1) {
					this.sdPosX++;
				} else {
					// 壁にぶつかった時
                    r -= this.HIT_WALL_PENALTY;
                }
                break;
                
			case this.DOWN:
                // 移動可能か
				if (this.MAZE[this.sPosY + 1][this.sPosX] == 1) {
					this.sdPosY++;
				} else {
					// 壁にぶつかった時
                    r -= this.HIT_WALL_PENALTY;
                }
				break;
		}
		
		// ゴール報酬の設定
		if (this.sdPosX == 9 && this.sdPosY == 9) {
            r = this.GOAL_REWARD;
		}
		
		return r;
	},
	
	// Q値の更新
	updateQ : function(r , a) {
		
		// 状態s'で行った時にQ値が最大となるような行動
		let maxA = 0;
		for (let i = 0; i < 4; i++) {
			if (this.q[maxA][this.sdPosY][this.sdPosX] < this.q[i][this.sdPosY][this.sdPosX]) {
				maxA = i;	
			}
		}
		
		// Q値の更新
		this.q[a][this.sPosY][this.sPosX] = (1.0 - this.ALPHA) * this.q[a][this.sPosY][this.sPosX] + this.ALPHA * (r + this.GAMMA * this.q[maxA][this.sdPosY][this.sdPosX]);	
	},
	
	// 状態の更新
	updateS : function() {
		this.sPosX = this.sdPosX;
		this.sPosY = this.sdPosY;
    },
    
    //
    showQA : function() {
		
		// Q値が最大となるような行動をすべて開示
		let maxA = 0;
		
        for (let y = 0; y < 11; y++) {
            for (let x = 0; x < 11; x++) {
                for (let i = 0; i < 4; i++) {
			        if (this.q[maxA][y][x] < this.q[i][y][x]) {
				        maxA = i;	
                    }
                }
                if (maxA == this.LEFT){
                    this.maxAction[y][x] = "←";
                }
                if (maxA == this.UP){
                    this.maxAction[y][x] = "↑";
                }
                if (maxA == this.RIGHT){
                    this.maxAction[y][x] = "→";
                }
                if (maxA == this.DOWN){
                    this.maxAction[y][x] = "↓";
                }
            }
		}	
	}  
}
