package com.smithfox.game;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;

public class GameActivity extends Activity {
	private final static String TAG="GA";
	private final static Handler handler = new Handler();
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
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

}