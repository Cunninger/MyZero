import httpx
import asyncio
import time

async def test():
    async with httpx.AsyncClient(trust_env=False, timeout=30.0) as client:
        print("=== Testing health ===")
        r = await client.get('http://127.0.0.1:8000/health')
        print('Health:', r.status_code, r.text)
        
        print("\n=== Testing optimize ===")
        r = await client.post('http://127.0.0.1:8000/api/optimize', json={
            'text': '人工智能是计算机科学的一个分支，它企图了解智能的实质。\n\n机器学习是人工智能的核心技术之一，通过数据驱动的方式让计算机自动学习和改进。',
            'mode': 'combined'
        })
        print('Optimize:', r.status_code)
        if r.status_code == 200:
            data = r.json()
            print('ID:', data['id'])
            print('Total segments:', data.get('total_segments'))
            print('Status:', data['status'])
            
            record_id = data['id']
            
            # Wait for background task to complete
            print('\nWaiting for background processing...')
            for i in range(30):
                time.sleep(2)
                r = await client.get('http://127.0.0.1:8000/api/optimize/%d' % record_id)
                data = r.json()
                print('  Status: %s' % data['status'])
                if data['status'] in ('completed', 'failed'):
                    break
            
            print('\n=== Testing detail ===')
            r = await client.get('http://127.0.0.1:8000/api/optimize/%d/detail' % record_id)
            print('Detail:', r.status_code)
            if r.status_code == 200:
                detail = r.json()
                print('Segments count:', len(detail.get('segments', [])))
                print('Changes count:', len(detail.get('changes', [])))
                for seg in detail.get('segments', []):
                    print('  Segment %d: %s (%d chars -> %d chars)' % (
                        seg['segment_index'], seg['status'],
                        len(seg['original_text']),
                        len(seg.get('optimized_text') or '')
                    ))
            
            print('\n=== Testing segments endpoint ===')
            r = await client.get('http://127.0.0.1:8000/api/optimize/%d/segments' % record_id)
            print('Segments:', r.status_code, 'count:', len(r.json()))
            
            print('\n=== Testing changes endpoint ===')
            r = await client.get('http://127.0.0.1:8000/api/optimize/%d/changes' % record_id)
            print('Changes:', r.status_code, 'count:', len(r.json()))
            for change in r.json():
                print('  Change %d (seg %d): %d -> %d chars' % (
                    change['id'], change['segment_index'],
                    len(change['before_text']), len(change['after_text'])
                ))
                if change.get('changes_detail'):
                    cd = change['changes_detail']
                    print('    Added: %d, Removed: %d, Delta: %d' % (
                        cd.get('added_count', 0), cd.get('removed_count', 0), cd.get('length_delta', 0)
                    ))
        else:
            print('Error:', r.text)

asyncio.run(test())
