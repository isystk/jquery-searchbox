(function($) {
	/*
	 * 検索機能付き セレクトボックス
	 *
	 * Copyright (c) 2020 iseyoshitaka
	 */
	$.fn.searchBox = function(opts) {

		// 引数に値が存在する場合、デフォルト値を上書きする
		var settings = $.extend({}, $.fn.searchBox.defaults, opts);
		
		var init = function (obj) {

			var self = $(obj),
				parent = self.closest('div,tr'),
				searchWord = ''; // 絞り込み文字列
			
			// 絞り込み検索用のテキスト入力欄の追加
			self.before('<input type="text" class="refineText" />');
			var refineText = parent.find('.refineText');
			refineText.css({
				'width': '250px',
				'height': '40px',
				'padding': '0px',
				'font-family': 'normal',
				'text-indent': '5px'
			});
			if (settings.mode === MODE.NORMAL) {
				refineText.attr('readonly', 'readonly');
			}
			
			// 初期表示で選択済みの場合、絞り込み文言入力欄に選択済みの文言を表示
			var selectedOption = self.find('option:selected');
			if(selectedOption){
				refineText.val(selectedOption.text());
			}

			// セレクトボックスの代わりに表示するダミーリストを作成
			var searchboxElement = $('<ul class="searchboxElement"></ul>');
			searchboxElement.append(_.map(self.find('option'), function(obj) {
				return '<li data-selected="off" data-searchval="' + $(obj).val() + '"><span>' + $(obj).text() + '</span></li>';
			}).join(''));
			searchboxElement.hide();
			self.after(searchboxElement);

			// ダミーリストの表示幅をセレクトボックスにあわせる
			var refineTextWidth = (settings.elementWidth) ? settings.elementWidth : self.width();
			searchboxElement.css({
				'min-width' : refineTextWidth + 'px'
			});

			// 元のセレクトボックスは非表示にする
			self.hide();

			// ダミーリスト選択時
			searchboxElement.find('li').click(function(e){
				e.preventDefault();
				// e.stopPropagation();
				var li = $(this),
					searchval = li.data('searchval');
				self.val(searchval).change();
				parent.find('li').attr('data-selected', 'off');
				li.attr('data-selected', 'on');
			});

			// ダミーリストを検索条件で絞り込みます。
			var changesearchboxElement = function() {
				var visibleTarget = searchboxElement.find('li');
				visibleTarget.show();
				if (searchWord !== '') {
					var matcher = searchWord.replace(/\\/g, '\\\\');
					visibleTarget = searchboxElement.find('li').filter(function(){
						return $(this).text().match(matcher);
					});
					searchboxElement.find('li').hide();
					visibleTarget.show();
				}
				
				// 選択中のLIタグの背景色を変更します。
				var selectedOption = self.find('option:selected');
				if(selectedOption){
					searchboxElement.find('li').removeClass('selected');
					searchboxElement.find('li[data-searchval="' + selectedOption.val() + '"]').addClass('selected');
				}
				
				if (0 < visibleTarget.length) {
					searchboxElement.show();
				} else {
					searchboxElement.hide();
				}
			};

			// keyup時のファンクション
			refineText.keyup(function(e){
				searchWord = $(this).val();
				// ダミーリストをリフレッシュ
				changesearchboxElement();
			});

			// セレクトボックス変更時
			self.change(function(){
				// 直近の絞り込み文言エリアへ選択オプションのテキストを反映
				var selectedOption = $(this).find('option:selected');
				searchWord = selectedOption.text();
				refineText.val(selectedOption.text());

				if (settings.selectCallback) {
					settings.selectCallback({
						selectVal: selectedOption.attr('value'),
						selectLabel: selectedOption.text()
					});
				}
			});

			// 絞り込み入力欄をクリックした場合はダミーリストを表示
			refineText.click(function(e) {
				e.preventDefault();

				// モードに合わせて設定
				if (settings.mode === MODE.NORMAL) {
					searchWord = '';
				} else if (settings.mode === MODE.INPUT) {
					refineText.val('');
					searchWord = '';
				} else if (settings.mode === MODE.TAG) {
					var selectedOption = self.find('option:selected');
					if (selectedOption.val() === '') {
						refineText.val('');
						searchWord = '';
					}
				}

				// ダミーリストをリフレッシュ
				$('.searchboxElement').hide();
				changesearchboxElement();
				
			});
			
			// 表示中のダミーリストを非表示
			$(document).click(function(e){
				if($(e.target).hasClass('refineText')){
					return;
				}
				searchboxElement.hide();
				if (settings.mode !== MODE.TAG) {
					var selectedOption = self.find('option:selected');
					searchWord = selectedOption.text();
					refineText.val(selectedOption.text());
				}
			});

		}

		$(this).each(function (){
			init(this);
		});

		return this;
	}
	
	var MODE = {
		NORMAL: 0, // 通常のセレクトボックス
		INPUT: 1, // 入力式セレクトボックス
		TAG: 2 // タグ追加式セレクトボックス
	};

	$.fn.searchBox.defaults = {
		selectCallback: null,
		elementWidth: null,
		mode: MODE.INPUT
	};

})(jQuery);
