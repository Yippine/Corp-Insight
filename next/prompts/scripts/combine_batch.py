#!/usr/bin/env python3
import os
import json
import sys
from pathlib import Path

def combine_batch_files(batch_number):
    """
    合併指定批次目錄下的所有 JSON 檔案

    Args:
        batch_number: 批次編號（可以是 1, 2, 3 或 0001, 0002, 0003 格式）
    """
    # 格式化批次編號為 4 位數
    batch_str = str(batch_number).zfill(4)

    # 設定路徑
    base_dir = Path('/mnt/c/Users/user/Documents/Yippine/Program/Corp-Insight/next/prompts/batches')
    batch_dir = base_dir / batch_str
    output_file = batch_dir / 'combined-content.json'

    # 檢查目錄是否存在
    if not batch_dir.exists():
        print(f"錯誤：批次目錄 {batch_dir} 不存在")
        return False

    # 準備結果結構
    combined_data = {
        "batch": batch_str,
        "batch_directory": str(batch_dir),
        "total_files": 0,
        "files": []
    }

    # 收集所有 JSON 檔案
    json_files = sorted(batch_dir.glob('*.json'))

    # 過濾掉 combined-content.json 本身
    json_files = [f for f in json_files if f.name != 'combined-content.json']

    if not json_files:
        print(f"警告：批次目錄 {batch_dir} 中沒有找到 JSON 檔案")
        return False

    print(f"找到 {len(json_files)} 個 JSON 檔案在批次 {batch_str}")

    # 讀取每個檔案
    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                content = json.load(f)

            file_info = {
                "filename": json_file.name,
                "filepath": str(json_file),
                "content": content
            }

            combined_data["files"].append(file_info)
            print(f"  ✓ 已處理: {json_file.name}")

        except Exception as e:
            print(f"  ✗ 讀取 {json_file.name} 時發生錯誤: {e}")
            continue

    # 更新檔案數量
    combined_data["total_files"] = len(combined_data["files"])

    # 寫入合併的 JSON 檔案
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(combined_data, f, ensure_ascii=False, indent=2)
        print(f"\n成功！已將 {combined_data['total_files']} 個檔案合併到:")
        print(f"  {output_file}")
        return True

    except Exception as e:
        print(f"寫入輸出檔案時發生錯誤: {e}")
        return False

def combine_all_batches():
    """合併所有批次"""
    base_dir = Path('/mnt/c/Users/user/Documents/Yippine/Program/Corp-Insight/next/prompts/batches')
    batch_dirs = sorted([d for d in base_dir.iterdir() if d.is_dir()])

    success_count = 0
    for batch_dir in batch_dirs:
        batch_number = batch_dir.name
        print(f"\n處理批次 {batch_number}...")
        if combine_batch_files(batch_number):
            success_count += 1

    print(f"\n總結：成功處理 {success_count}/{len(batch_dirs)} 個批次")

def main():
    """主程式"""
    if len(sys.argv) < 2:
        print("使用方式:")
        print("  python3 combine_batch.py <批次編號>  # 處理單一批次")
        print("  python3 combine_batch.py all          # 處理所有批次")
        print("\n範例:")
        print("  python3 combine_batch.py 1")
        print("  python3 combine_batch.py 0001")
        print("  python3 combine_batch.py all")
        sys.exit(1)

    batch_arg = sys.argv[1]

    if batch_arg.lower() == 'all':
        combine_all_batches()
    else:
        try:
            # 支援 1, 2, 3 或 0001, 0002, 0003 格式
            batch_number = int(batch_arg)
            combine_batch_files(batch_number)
        except ValueError:
            print(f"錯誤：無效的批次編號 '{batch_arg}'")
            print("批次編號必須是數字，例如: 1, 2, 3 或 0001, 0002, 0003")
            sys.exit(1)

if __name__ == "__main__":
    main()
