package com.smithfox.game;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Paint.Align;
import android.graphics.Rect;
import android.os.Bundle;
import android.util.Log;
import android.view.SurfaceHolder;

public class GameSurface implements SurfaceHolder.Callback, Runnable {
	private final static String TAG="GS";

	private SurfaceHolder holder;
	private int width, height;
	private Paint paint = null;
	private boolean running=false;

	private long start, now, next, last, millis;
	final static int MILLIS_PER_TICK = 20;
	
	public GameSurface(SurfaceHolder holder) {
		this.holder = holder;
		
		paint = new Paint();
		paint.setTextSize(100.0f);
		paint.setColor(Color.WHITE);
		paint.setTextAlign(Align.CENTER);
	}

	@Override
	public void surfaceChanged(SurfaceHolder holder, int format, int width,	int height) {
		Log.d(TAG, "surfaceChanged, w="+width+",h="+height);
		this.height = height;
		this.width = width;
		World.w = this.width;
		World.h = this.height;
//		if(stopped) {
//			new Thread(this).start();
//		}
	}

	@Override
	public void surfaceCreated(SurfaceHolder holder) {
		Log.d(TAG, "surfaceCreated");
	}

	@Override
	public void surfaceDestroyed(SurfaceHolder holder) {
		Log.d(TAG, "surfaceDestroyed");
		this.running = false;
	}
	
	public void load(Bundle savedInstanceState) {
		Log.d(TAG, "load, savedInstanceState="+savedInstanceState);
		if(savedInstanceState != null) {
			last = millis = savedInstanceState.getLong("last");
		}
	}
	
	public void resume() {
		Log.d(TAG, "resume");
		if(holder.getSurface() != null && !running) {
			running = true;
			new Thread(this).start();
		}
	}
	
	public void save(Bundle outState) {
		Log.d(TAG, "save");
		outState.putLong("last", millis);
	}
	
	public void pause() {
		Log.d(TAG, "pause");
		running = false;
		last = millis;
	}
	
	public void drawWorm(Worm m, Canvas c) {
		this.paint.setColor(Color.RED);
		Rect r = new Rect(m.state_x, m.state_y, m.state_x+4, m.state_y+4);
		c.drawRect(r, this.paint);
	}
	
	private void draw(long count) {
		Canvas c = null;
		try {
			//Log.d(TAG, "draw");
			c = holder.lockCanvas();
			if(c!=null) {
				this.paint.setColor(Color.WHITE);
				Rect r = new Rect(0,0,this.width,this.height);
				c.drawRect(r, this.paint);
				for(Worm m : World.worms) {
					drawWorm(m,c);
				}

//				c.drawARGB(255, 0, 0, 0);
//				c.drawText("" + count/1000, this.width/2, this.height/2, this.paint);
			} else {
				Log.d(TAG, "lockCanvas return null");
			}
		} catch (Exception e) {
			Log.e(TAG, "", e);
		} finally {
			if (c != null) {
				holder.unlockCanvasAndPost(c);
			}
		}
	}

	@Override
	public void run() {
		start = System.currentTimeMillis();
		Log.d(TAG, "Thread start");
		try {
			while (running) {
//				try{
					_runOne();
//				} catch(Exception e) {
//					e.printStackTrace();
//				}
			}
		} finally {
			running = false;
		}
		Log.d(TAG, "Thread end");
	}
	
	private void _runOne() {
		now = System.currentTimeMillis();
		if (now > next) {
			millis = last + now - start;
			World.turn();
			draw(millis);
			next = now + MILLIS_PER_TICK;
		} else {
            try {
                Thread.sleep(next - now);
            } catch (Exception ex) {
            }
		}
	}
}