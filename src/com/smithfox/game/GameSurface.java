package com.smithfox.game;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.util.Log;
import android.view.SurfaceHolder;

public class GameSurface implements SurfaceHolder.Callback, Runnable {
	private final static String TAG="GS";
	private Thread myThread;
	
	private SurfaceHolder holder;
	private int ScreenW=0;
	private int ScreenH=0;
	public boolean isRun;

	public GameSurface(SurfaceHolder holder) {
		this.holder = holder;
//		ScreenW = w;
//        ScreenH = h;
	}
	
	@Override
	public void surfaceCreated(SurfaceHolder holder) {
		Log.d(TAG, "surfaceCreated");
		this.isRun = true;
		myThread = new Thread(this);
		myThread.start();
	}

	@Override
	public void surfaceChanged(SurfaceHolder holder, int format, int width,	int height) {
		Log.d(TAG, "surfaceChanged, w="+width+",h="+height);
		this.ScreenH = height;
		this.ScreenW = width;
	}

	@Override
	public void surfaceDestroyed(SurfaceHolder holder) {
		Log.d(TAG, "surfaceDestroyed");
		this.isRun = false;
	}
	
	private void draw(int count) {
		Canvas c = null;
		try {
			Log.d(TAG, "draw");
			c = holder.lockCanvas();
			if(c!=null) {
				//c.drawColor(Color.BLACK);
				Paint p = new Paint();
				p.setColor(Color.WHITE);
				Rect r = new Rect(0, 0, ScreenW, ScreenH);
				//Rect r = new Rect(50, 50, 100, 100);
				c.drawRect(r, p);
				p.setColor(Color.BLUE);
				c.drawText("现在:" + count + "秒", 100, 310, p);
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
		int count = 0;
		Log.d(TAG, "Thread start");
		while (isRun) {
			draw(count);
			count++;
            try {
                Thread.sleep(1000);
            } catch (Exception ex) {
            }
		}

		Log.d(TAG, "Thread end");
	}
	
}