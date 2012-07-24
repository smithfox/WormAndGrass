package com.smithfox.game;

import android.content.Context;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

public class GameView extends SurfaceView implements SurfaceHolder.Callback {
	private final static String TAG="GV";
	private SurfaceHolder holder;
	private GameThread myThread;
	
	public GameView(Context context) {
		super(context);
		this.setKeepScreenOn(true);
		this.setLongClickable(true);
		this.setKeepScreenOn(true);// 保持屏幕常亮
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
		myThread = new GameThread(holder,this.getWidth(),this.getHeight());
		myThread.isRun = true;
		myThread.start();
	}

	@Override
	public void surfaceDestroyed(SurfaceHolder holder) {
		Log.d(TAG, "surfaceDestroyed");
		myThread.isRun = false;
	}
}