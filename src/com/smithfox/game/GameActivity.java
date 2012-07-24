package com.smithfox.game;

import android.app.Activity;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

public class GameActivity extends Activity {
	private final static String TAG="GA";
	private final static Handler handler = new Handler();
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(new Game1View(this));
	}

	@Override
	protected void onDestroy() {
		Log.d(TAG, "onDestroy");
		super.onDestroy();

		handler.postDelayed(new Runnable() {
            public void run() {
            	Log.d(TAG, "!!! GameActivity say goodbye to you");
                System.exit(0);
            }
        }, 500);
	}
	
	class Game1View extends SurfaceView implements SurfaceHolder.Callback {
		private SurfaceHolder holder;
		private MyThread myThread;

		public Game1View(Context context) {
			super(context);
			this.setKeepScreenOn(true);
			this.setLongClickable(true);
			Log.d(TAG, "Game1View");
			holder = this.getHolder();
			holder.addCallback(this);
		}

		@Override
		public void surfaceChanged(SurfaceHolder holder, int format, int width,	int height) {
			Log.d(TAG, "surfaceChanged");
		}

		@Override
		public void surfaceCreated(SurfaceHolder holder) {
			Log.d(TAG, "surfaceCreated");
			myThread = new MyThread(holder);
			myThread.isRun = true;
			myThread.start();
		}

		@Override
		public void surfaceDestroyed(SurfaceHolder holder) {
			Log.d(TAG, "surfaceDestroyed");
			myThread.isRun = false;
		}
	}

	class MyThread extends Thread {
		private SurfaceHolder holder;
		public boolean isRun;

		public MyThread(SurfaceHolder holder) {
			this.holder = holder;
			isRun = true;
		}

		private void draw(int count) {
			Canvas c = null;
			try {
				Log.d(TAG, "draw");
				c = holder.lockCanvas();
				if(c!=null) {
					c.drawColor(Color.BLACK);
					Paint p = new Paint();
					p.setColor(Color.WHITE);
					Rect r = new Rect(100, 50, 300, 250);
					c.drawRect(r, p);
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
}