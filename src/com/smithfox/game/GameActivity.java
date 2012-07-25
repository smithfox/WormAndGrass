package com.smithfox.game;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.widget.Button;

public class GameActivity extends Activity {
	private final static String TAG="GA";
	private final static Handler handler = new Handler();
	
	private SurfaceView gameview;
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);

        gameview=(SurfaceView)this.findViewById(R.id.gameview);

        gameview.setLongClickable(true);
        gameview.setKeepScreenOn(true);// 保持屏幕常亮

        //gameview.getHolder().setFixedSize(300, 300);//设置分辨率
        gameview.getHolder().setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);//设置surfaceview不维护自己的缓冲区，而是等待屏幕的渲染引擎将内容推送到用户面前
        gameview.getHolder().addCallback(new GameSurface(gameview.getHolder()));//对surface对象的状态进行监听
        
        ButtonOnClikListiner buttonOnClikListinero=new ButtonOnClikListiner();
        Button btn1=(Button) this.findViewById(R.id.button1);
        Button btn2=(Button) this.findViewById(R.id.button2);
        Button btn3=(Button) this.findViewById(R.id.button3);
        btn1.setOnClickListener(buttonOnClikListinero);
        btn2.setOnClickListener(buttonOnClikListinero);
        btn3.setOnClickListener(buttonOnClikListinero);
	}
	
	private final class ButtonOnClikListiner implements View.OnClickListener{
        @Override
        public void onClick(View v) {
//            if(Environment.getExternalStorageState()==Environment.MEDIA_UNMOUNTED){
//                Toast.makeText(GameActivity.this, "sd卡不存在", Toast.LENGTH_SHORT).show();
//                return;
//            }

            switch (v.getId()) {
            case R.id.button1:
                //
                break;
            case R.id.button2:
                //
                break;
            case R.id.button3:
                //
                break;
            }
        }
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