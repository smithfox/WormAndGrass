package com.smithfox.game;

public class Worm implements Mote{
	byte gen[];//最本质的基因, 可以遗传给下一代, 由World的遗传算法规则决定怎样变异, 怎样混合
	
	//所有以state_开头的变量是当前个体的各种状态
	int state_life;
	int state_engine;
	int state_x,state_y;
	
	int state_px,state_py;
	
	int state_step = 1;
	int state_pstep = 1;
	
	public Worm(byte[] gen, int state_x, int state_y) {
		this.gen = new byte[gen.length];
		System.arraycopy(gen, 0, this.gen, 0, gen.length);
		
		state_life = 0;
		state_engine = 100;
		
		this.state_x = state_x;
		this.state_y = state_y;
	}
	
	public void enter() {
		
	}
	
	public void leave() {
		
	}

	//有防守属性, 但并不表示有防守实力, 比如一头已经奄奄一息的狮子
	//草的防守属性为0
	public int attr_Defence() {
		return 1;
	}
	
	//有进攻属性, 但并不表示有进攻实力, 比如一头已经奄奄一息的狮子
	public int attr_Attack() {
		return 1;
	}
	
	//0--up, 1--right, 2--down, 3--left
	//cost  1 clock, 1 engine
	public void move(byte direction) {
		state_engine -= 1;
		if(state_engine<=0) return;
		
		switch(direction) {
		case 0:
			state_y -= state_step;
			break;
		case 1:
			state_x += state_step;
			break;
		case 2:
			state_y += state_step;
			break;
		case 3:
			state_x -= state_step;
			break;
		}
		
		if(state_x<0) {
			state_x = World.w + state_x;
		} else if(state_x>World.w) {
			state_x = state_x - World.w;
		}
		
		if(state_y<0) {
			state_y = World.h + state_y;
		} else if(state_y>World.h) {
			state_y = state_y - World.h;
		}
	}
	
	//0--up, 1--right, 2--down, 3--left
	//cost  1 clock, 1 engine
	public void moveprobe(byte direction) {
		state_engine -= 1;
		if(state_engine<=0) return;
		
		switch(direction) {
		case 0:
			state_py -= state_pstep;
			break;
		case 1:
			state_px += state_pstep;
			break;
		case 2:
			state_py += state_pstep;
			break;
		case 3:
			state_px -= state_pstep;
			break;
		}
		
		if(state_px<0) {
			state_px = World.w + state_px;
		} else if(state_px>World.w) {
			state_px = state_px - World.w;
		}
		
		if(state_py<0) {
			state_py = World.h + state_py;
		} else if(state_py>World.h) {
			state_py = state_py - World.h;
		}
	}
	
	public void probe() {
		
	}
	
	public void eat() {
		Mote m = World.here(this.state_x, this.state_y);
		if(m != null) {
			
		}
	}
}