package com.smithfox.game;

import java.util.LinkedList;
import java.util.List;

public class World {
	public static int w = 0;
	public static int h = 0;
	
	public static List<Worm> worms = new LinkedList<Worm>();
	public static Mote whatIsHere(int x, int y) {
		return null;
	}
	
	public static void turn() {
		for(Worm m : worms) {
			int direction = ((int)(Math.random() * 10)) % 4;
			m.move(direction);
		}
	}
	
	public static void addRandomWorm() {
		Worm m = new Worm(new byte[8], 20,20);
		worms.add(m);
	}
}
