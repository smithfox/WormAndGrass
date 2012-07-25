package com.smithfox.game;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.PowerManager;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
//import android.view.View;
//import android.widget.Button;
import android.widget.Toast;

public class GameActivity extends Activity {
	private final static String TAG="GA";
	private final static Handler handler = new Handler();
	
	private SurfaceView gameview;
	private GameSurface gamesurface;
	
	private PowerManager.WakeLock wakeLock = null;
	
	//在onCreata中，初始化游戏状态或恢复游戏状态
	@Override
	public void onCreate(Bundle savedInstanceState) {
		Log.d(TAG, "onCreate");
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main2);

        gameview=(SurfaceView)this.findViewById(R.id.gameview);

        gameview.setLongClickable(true);
        gameview.setKeepScreenOn(true);// 保持屏幕常亮

        //gameview.getHolder().setFixedSize(300, 300);//设置分辨率
        //gameview.getHolder().setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);//设置surfaceview不维护自己的缓冲区，而是等待屏幕的渲染引擎将内容推送到用户面前
        
        gamesurface = new GameSurface(gameview.getHolder());
        gameview.getHolder().addCallback(gamesurface);//对surface对象的状态进行监听
        
        gamesurface.load(savedInstanceState);

        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
		wakeLock = pm.newWakeLock(PowerManager.SCREEN_DIM_WAKE_LOCK, getText(R.string.app_name).toString());
		
//        ButtonOnClikListiner buttonOnClikListinero=new ButtonOnClikListiner();
//        Button btn1=(Button) this.findViewById(R.id.button1);
//        Button btn2=(Button) this.findViewById(R.id.button2);
//        Button btn3=(Button) this.findViewById(R.id.button3);
//        btn1.setOnClickListener(buttonOnClikListinero);
//        btn2.setOnClickListener(buttonOnClikListinero);
//        btn3.setOnClickListener(buttonOnClikListinero);
	}
	
	//在onRestart中恢复游戏状态
	@Override
	protected void onRestart() {
		Log.d(TAG, "onRestart");
		super.onRestart();
		gamesurface.load(null);
	}
	
	//在onResume中开始游戏循环
	//本应在onStart中，但是我们看到，各种情况下，onResume都会在onStart之后调用
	//所以简单的用onResume代替了onStart
	@Override
	protected void onResume() {
		Log.d(TAG, "onResume");
		super.onResume();
		if( wakeLock != null && !wakeLock.isHeld()) {
			wakeLock.acquire();
		}

		gamesurface.resume();
	}
	
	//在onSaveInstanceState中保存游戏状态
	@Override
	protected void onSaveInstanceState(Bundle outState) {
		Log.d(TAG, "onSaveInstanceState");
		super.onSaveInstanceState(outState);
		gamesurface.save(outState);
	}
	
	//在onPause中结束游戏循环
	@Override
	protected void onPause() {
		Log.d(TAG, "onPause");
		super.onPause();
		gamesurface.pause();
		if( wakeLock != null  && wakeLock.isHeld()) {
			wakeLock.release();
		}
	}
/*
	@Override
	public void onWindowFocusChanged(boolean hasFocus) {
		Log.d(TAG, "onWindowFocusChanged");
		super.onWindowFocusChanged(hasFocus);
		if(hasWindowFocus()) {
			gamesurface.resume();
		} else {
			gamesurface.pause();
		}
	}
*/
	//在onDestory中销毁游戏数据
	@Override
	protected void onDestroy() {
		Log.d(TAG, "onDestroy");
		super.onDestroy();
		gamesurface.pause();
		gamesurface = null;
		handler.postDelayed(new Runnable() {
            public void run() {
            	Log.d(TAG, "!!! GameActivity say goodbye to you");
                System.exit(0);
            }
        }, 500);
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		menu.add(0, Menu.FIRST, 0, "Button1");//.setIcon(R.drawable.icon);  //设置文字与图标
		menu.add(0, Menu.FIRST+1, 0, "Button2");
		menu.add(0, Menu.FIRST+2, 0, "Button3");

		return super.onCreateOptionsMenu(menu);
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		switch (item.getItemId()) {
		case 1:
			Toast.makeText(this, "你点击了Button1", Toast.LENGTH_SHORT).show();
			break;
		case 2:
			Toast.makeText(this, "你点击了Button2", Toast.LENGTH_SHORT).show();
			break;
		case 3:
			Toast.makeText(this, "你点击了Button3", Toast.LENGTH_SHORT).show();
			break;
		}
		return super.onOptionsItemSelected(item);
	}

	@Override
	public void onOptionsMenuClosed(Menu menu) {
		//Toast.makeText(this, "你关闭了选项菜单", Toast.LENGTH_SHORT).show();
		super.onOptionsMenuClosed(menu);
	}

	@Override
	public boolean onPrepareOptionsMenu(Menu menu) {
		//Toast.makeText(this, "选项菜单显示之前onPrepareOptionsMenu方法会被调用", Toast.LENGTH_LONG).show();
		// 如果返回false，此方法就把用户点击menu的动作给消费了，
		// onCreateOptionsMenu方法将不会被调用
		return true;

		//return super.onPrepareOptionsMenu(menu);
	}
/*
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
*/


}